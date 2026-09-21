'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { TOUR } from '@/modules/onboarding/tour/anchors';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { useIsCompact } from '@/lib/useIsCompact';
import { formatTotals } from '@/lib/money';
import useCreateBooking from '@/services/appointments/useCreateBooking';
import useGetSettings from '@/services/settings/useGetSettings';
import useGetServices from '@/services/services/useGetServices';
import useGetStaff from '@/services/staff/useGetStaff';
import useGetSlotsForBooking from '@/services/availability/useGetSlotsForBooking';
import type { BookingWarning } from '@/services/appointments/appointments.service';
import BookingClientPanel from './BookingClientPanel';
import BookingMobileBar from './BookingMobileBar';
import BookingServicePicker from './BookingServicePicker';
import BookingServicesEditor from './BookingServicesEditor';
import BookingWhenField from './BookingWhenField';
import useBookingDraft from './useBookingDraft';
import { eligibleStaffFor } from './utils/eligibleStaff';
import { minutesInTimeZone } from './utils/calendarLayout';

/**
 * Lo que el click en la agenda ya dijo.
 *
 * No es una reserva a medio hacer: es el punto de partida. El día siempre; la
 * hora y el profesional cuando el click salió de una celda concreta y no del
 * botón flotante.
 */
export interface BookingSeed {
	date: string;
	minute: number | null;
	staffId: string | null;
}

interface Props {
	/** Lo que el click en la agenda ya dijo. Ausente, el drawer está cerrado. */
	seed: BookingSeed | null;
	/** Hoy en la zona del negocio. */
	todayKey: string;
	onClose: () => void;
	/** Advertencias con las que el backend aceptó la reserva. */
	/**
	 * Lo guardado, para que la agenda pueda reaccionar.
	 *
	 * El día viaja además de los avisos porque la fecha se puede cambiar acá
	 * adentro: guardada para otro día, la cita queda fuera de lo que se está
	 * mirando y el cambio parece no haber pasado.
	 */
	onSaved?: (warnings: BookingWarning[], dayKey: string | null) => void;
}

interface FormProps {
	seed: BookingSeed;
	todayKey: string;
	onClose: () => void;
	onSaved?: (warnings: BookingWarning[], dayKey: string | null) => void;
	/**
	 * El buscador de clientes, controlado desde afuera.
	 *
	 * Lo sostiene el drawer y no el formulario porque abrirlo ensancha el panel
	 * entero: el ancho es del drawer, así que el estado que lo decide tiene que
	 * vivir donde se aplica.
	 */
	clientOpen: boolean;
	onClientOpenChange: (open: boolean) => void;
}

/**
 * Armar una reserva nueva.
 *
 * El panel está partido en dos columnas que hacen cosas distintas: a la
 * izquierda, quién; a la derecha, qué y cuándo. No es una decoración. Elegir el
 * cliente y armar la reserva son dos búsquedas independientes que se hacen en
 * cualquier orden, y ponerlas una encima de la otra hacía que cada una empujara
 * a la otra fuera de la pantalla justo cuando se la estaba usando.
 *
 * La columna de la derecha es una secuencia: primero el servicio, después todo
 * lo demás. Ese orden no se eligió por estética — hasta que no hay un servicio
 * no se sabe cuánto dura la reserva, y sin la duración el motor de
 * disponibilidad no puede decir a qué hora entra. Por eso la fecha no está
 * arriba de todo como si fuera el primer paso: aparece recién cuando ya se
 * puede hacer algo con ella, y se edita ahí mismo.
 *
 * Editar una reserva existente no pasa por acá: para eso está `BookingDrawer`,
 * donde no hay un primer paso porque ya está todo elegido.
 */
const NewBookingForm: React.FC<FormProps> = ({
	seed,
	todayKey,
	onClose,
	onSaved,
	clientOpen,
	onClientOpenChange,
}) => {
	const { data: services = [] } = useGetServices();
	const { data: staff = [] } = useGetStaff();
	const { data: settings } = useGetSettings();
	const { mutateAsync: create, isPending: busy } = useCreateBooking();

	const timezone = settings?.timezone;
	// Sin configuración todavía, el código ISO es el del negocio por defecto.
	const currency = settings?.currency ?? 'BOB';

	const draft = useBookingDraft({ booking: null, services, timezone });

	/**
	 * El día que se está mirando.
	 *
	 * Es estado propio y no `draft.dayKey`: mientras no haya horario elegido el
	 * borrador no tiene día, y la pantalla igual tiene que mostrar uno —el del
	 * hueco que se clickeó— desde el primer momento.
	 */
	const [day, setDay] = useState(seed.date);
	const [picking, setPicking] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);

	const hasServices = draft.items.length > 0;
	// Sin servicios no hay nada que elegir todavía: la pantalla es el buscador.
	const showPicker = !hasServices || picking;

	const { startTimes } = useGetSlotsForBooking({
		date: day,
		items: draft.slotItems,
		scope: 'panel',
		enabled: hasServices,
	});

	/*
	 * El hueco que se clickeó en la agenda, si el motor lo ofrece.
	 *
	 * Se aplica cuando aparecen los horarios —o sea, recién cuando hay un
	 * servicio elegido— y una sola vez: después manda lo que la persona elija.
	 */
	const seedApplied = useRef(false);

	useEffect(() => {
		if (seedApplied.current) return;
		if (seed.minute === null || startTimes.length === 0) return;

		const match = startTimes.find(
			(startTime) => minutesInTimeZone(startTime, timezone) === seed.minute,
		);
		if (!match) return;

		seedApplied.current = true;
		draft.setStartTime(match);
	}, [seed.minute, startTimes, timezone, draft]);

	const addService = (serviceId: string) => {
		const eligible = eligibleStaffFor(staff, serviceId);
		if (eligible.length === 0) return;

		/*
		 * Se propone al profesional que ya está en la reserva si puede hacerlo, y
		 * si no al de la columna donde se clickeó. Es lo más probable —el cliente
		 * vino a atenderse con alguien— y evita una segunda elección para el caso
		 * normal.
		 */
		const preferred =
			eligible.find((member) =>
				draft.items.some((item) => item.staffId === member.id),
			) ??
			eligible.find((member) => member.id === seed.staffId) ??
			eligible[0];

		draft.setItems([...draft.items, { serviceId, staffId: preferred.id }]);
		setPicking(false);
		setSaveError(null);
	};

	/** Un id y no un nombre: sin cliente elegido no hay reserva que crear. */
	const isComplete =
		draft.client.id !== null && hasServices && draft.startTime !== null;

	const canSave =
		!busy && isComplete && draft.summary.unknownServiceIds.length === 0;

	const handleSave = async () => {
		if (!draft.startTime || !canSave) return;

		setSaveError(null);

		try {
			const created = await create({
				clientId: draft.client.id as string,
				startTime: draft.startTime,
				items: draft.items,
			});

			onSaved?.(created.warnings, draft.dayKey);
			onClose();
		} catch (error) {
			// El 409 trae el motivo real —ocupado, cerrado, recién tomado— y es lo
			// que hay que decir en lugar de un "no se pudo".
			const message =
				axios.isAxiosError(error) && typeof error.response?.data === 'object'
					? ((error.response?.data as { message?: string }).message ?? null)
					: null;

			setSaveError(message ?? 'No se pudo guardar. Intentá de nuevo.');
		}
	};

	return (
		/*
		 * Dos columnas desde `sm`; en móvil, todo apilado. El `relative` sostiene
		 * al buscador de clientes, que en pantalla angosta se abre encima del
		 * formulario en vez de robarle la mitad del ancho.
		 *
		 * El orden de lo apilado no es el del código: en móvil la columna de la
		 * derecha es `contents`, así que sus hijos son hijos de este mismo flex y
		 * el `order` de cada uno los intercala con la tarjeta del cliente. Ver el
		 * comentario de cada pieza.
		 */
		<div
			className="relative flex min-h-0 flex-1 flex-col sm:flex-row"
			data-tour={TOUR.bookingForm}
		>
			{/*
			 * Eligiendo servicio, la tarjeta del cliente va arriba de la lista: es lo
			 * que ya se decidió y lo que da contexto a lo que se está por elegir.
			 * Mirando la reserva armada, va abajo de la fecha, que es lo que la
			 * define —y es el orden de la referencia—.
			 */}
			<BookingClientPanel
				client={draft.client}
				onChange={(next) => {
					draft.setClient(next);
					setSaveError(null);
				}}
				dialCode={settings?.dialCode}
				open={clientOpen}
				onOpenChange={onClientOpenChange}
				className={cn('sm:order-1', showPicker ? 'order-1' : 'order-2')}
			/>

			<div className="contents sm:order-2 sm:flex sm:min-h-0 sm:min-w-0 sm:flex-1 sm:flex-col">
				<header
					className={cn(
						'border-b border-border px-4 py-3 sm:order-1 sm:px-5 sm:py-4',
						showPicker ? 'order-2' : 'order-1',
					)}
				>
					{showPicker ? (
						<div className="flex items-center gap-2">
							{hasServices && (
								<Button
									variant="ghost"
									size="icon-sm"
									aria-label="Volver a la reserva"
									onClick={() => setPicking(false)}
								>
									<ChevronLeft className="size-4" />
								</Button>
							)}
							<h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
								{hasServices ? 'Añadir un servicio' : 'Seleccionar un servicio'}
							</h2>
						</div>
					) : (
						/*
						 * La fecha y la hora son el encabezado, no un campo más: una vez
						 * elegido el servicio, son lo que define la reserva y lo que más se
						 * corrige. Se editan donde se leen.
						 */
						<BookingWhenField
							dayKey={day}
							onDayChange={(next) => {
								setDay(next);
								// Los horarios libres del día nuevo son otros: conservar el
								// anterior dejaría una hora que no pertenece a este día.
								draft.setStartTime(null);
								setSaveError(null);
							}}
							startTime={draft.startTime}
							onStartTimeChange={(next) => {
								draft.setStartTime(next);
								setSaveError(null);
							}}
							todayKey={todayKey}
							timezone={timezone}
							items={draft.slotItems}
							totalMinutes={draft.summary.totalMinutes}
							disabled={busy}
						/>
					)}
				</header>

				<div className="order-3 min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
					{showPicker ? (
						<BookingServicePicker
							services={services}
							staff={staff}
							onPick={addService}
							pickedIds={draft.items.map((item) => item.serviceId)}
						/>
					) : (
						<div className="space-y-5">
							<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
								Servicios · {draft.items.length}
							</p>

							<BookingServicesEditor
								items={draft.items}
								onChange={(next) => {
									draft.setItems(next);
									setSaveError(null);
								}}
								services={services}
								staff={staff}
								currency={currency}
								offsets={draft.offsets}
								prices={draft.prices}
								startMinute={
									draft.startTime
										? minutesInTimeZone(draft.startTime, timezone)
										: null
								}
								preferredStaffId={seed.staffId}
								onAddRequest={() => setPicking(true)}
								disabled={busy}
							/>

							{draft.client.id === null && (
								<p className="text-sm text-muted-foreground">
									{/* Dónde está la tarjeta depende del ancho: al costado en el
									 * panel de dos columnas, acá arriba cuando está apilado. */}
									<span className="sm:hidden">
										Falta el cliente. Elegilo en la tarjeta de arriba.
									</span>
									<span className="hidden sm:inline">
										Falta el cliente. Elegilo en el panel de la izquierda.
									</span>
								</p>
							)}

							{saveError && (
								<p className="rounded-md border border-red-500/50 bg-red-50 p-3 text-sm text-destructive dark:bg-red-950/40">
									{saveError}
								</p>
							)}
						</div>
					)}
				</div>

				{/*
				 * En móvil el pie se apila: el total en un renglón y los botones en
				 * otro. Con todo en una sola fila, a 375px el total y dos botones se
				 * repartían el ancho hasta que "Guardar" quedaba más angosto que su
				 * propia palabra. El `env(safe-area-inset-bottom)` es para que el botón
				 * no termine abajo del indicador de home.
				 */}
				<footer className="order-4 flex flex-col gap-3 border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:pb-3">
					<div className="flex items-baseline justify-between gap-4 sm:block">
						<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
							Total
						</p>
						<div className="flex items-baseline gap-2 sm:block">
							<p className="text-xl font-semibold tabular-nums">
								{formatTotals(
									draft.summary.totals,
									currency,
									draft.summary.unpriced,
								)}
							</p>
							<p className="text-xs text-muted-foreground tabular-nums">
								{draft.summary.totalMinutes} min
							</p>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<Button variant="ghost" disabled={busy} onClick={onClose}>
							Cancelar
						</Button>
						{/*
						 * Se queda con el ancho que sobra en móvil. Es la acción del panel
						 * y la que se toca con el pulgar; "Cancelar" ya tiene además la
						 * "X" de arriba.
						 */}
						<Button
							size="lg"
							className="flex-1 sm:flex-none"
							disabled={!canSave}
							onClick={() => void handleSave()}
						>
							{busy && <Spinner className="size-3.5" />}
							Guardar
						</Button>
					</div>
				</footer>
			</div>
		</div>
	);
};

/**
 * El panel de una reserva nueva.
 *
 * El formulario se monta con el hueco como clave: lo que quedó a medio elegir
 * pertenece a *ese* hueco y muere con él, sin necesidad de limpiarlo a mano al
 * cerrar ni al abrir otro.
 */
const NewBookingDrawer: React.FC<Props> = ({
	seed,
	todayKey,
	onClose,
	onSaved,
}) => {
	const [clientOpen, setClientOpen] = useState(false);

	/**
	 * En móvil el panel arranca preguntando por el cliente.
	 *
	 * En escritorio las dos columnas conviven y el orden lo elige quien reserva:
	 * el servicio está a la derecha, el cliente a la izquierda, y se llenan en
	 * cualquier orden. Apilado eso no existe —sólo se ve una cosa por vez— así
	 * que hay que elegir por dónde empieza, y empieza por el cliente: es de quien
	 * es la reserva, es lo que la lista larga hace tedioso encontrar después, y
	 * es lo único sin lo cual no se puede guardar.
	 *
	 * Después de elegirlo el buscador se cierra solo y lo que queda a la vista es
	 * el catálogo de servicios, que es el paso siguiente. Nadie escribió una
	 * secuencia: son los mismos dos estados de siempre, que apilados se leen uno
	 * atrás del otro.
	 */
	const isCompact = useIsCompact();

	const [lastSeed, setLastSeed] = useState(seed);

	if (seed !== lastSeed) {
		setLastSeed(seed);
		setClientOpen(seed !== null && isCompact);
	}

	return (
		<Drawer
			direction="right"
			open={Boolean(seed)}
			onOpenChange={(next) => {
				if (!next) {
					setClientOpen(false);
					onClose();
				}
			}}
		>
			{/*
			 * El ancho va con la variante de vaul y no con un `sm:max-w-*` suelto: la
			 * clase propia de `DrawerContent` lleva un selector de atributo y le gana
			 * a cualquier `max-w` plano. Con dos columnas eso se nota enseguida.
			 *
			 * 2xl y no más: al formulario le quedan unos 495px, que es lo que pide una
			 * fila con el nombre del servicio a la izquierda y el precio a la derecha.
			 * Más ancho no agrega nada —no hay una tercera columna que poner— y deja
			 * las filas estiradas con el medio vacío.
			 *
			 * El salto al abrir el buscador de clientes es casi el mismo que crece el
			 * panel, así que el formulario no se corre de lugar mientras se elige.
			 */}
			<DrawerContent
				className={cn(
					'transition-[max-width] duration-200',
					clientOpen
						? 'data-[vaul-drawer-direction=right]:sm:max-w-3xl'
						: 'data-[vaul-drawer-direction=right]:sm:max-w-2xl',
				)}
			>
				{/*
				 * El título va sólo para el lector de pantalla. En la pantalla ya lo
				 * dice el encabezado del formulario —"Seleccionar un servicio", o la
				 * fecha— y repetirlo arriba gastaba un renglón en decir "Nueva reserva"
				 * dos veces. Pero el diálogo necesita uno: sin él, a quien navega por
				 * voz el panel se le abre sin nombre.
				 */}
				<DrawerHeader className="sr-only">
					<DrawerTitle>Nueva reserva</DrawerTitle>
					<DrawerDescription>
						Elegí el servicio, el horario y el cliente.
					</DrawerDescription>
				</DrawerHeader>

				<BookingMobileBar title="Nueva reserva" onClose={onClose} />

				{seed && (
					<NewBookingForm
						key={`${seed.date}:${seed.minute}:${seed.staffId}`}
						seed={seed}
						todayKey={todayKey}
						onClose={onClose}
						onSaved={onSaved}
						clientOpen={clientOpen}
						onClientOpenChange={setClientOpen}
					/>
				)}
			</DrawerContent>
		</Drawer>
	);
};

export default NewBookingDrawer;
