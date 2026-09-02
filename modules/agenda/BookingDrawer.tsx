'use client';

import { useState } from 'react';
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
import { Spinner } from '@/components/ui/spinner';
import useGetAppointmentDetail from '@/services/appointments/useGetAppointmentDetail';
import useEditBooking from '@/services/appointments/useEditBooking';
import useGetSettings from '@/services/settings/useGetSettings';
import type { BookingWarning } from '@/services/appointments/appointments.service';
import useGetServices from '@/services/services/useGetServices';
import useGetStaff from '@/services/staff/useGetStaff';
import useGetSlotsForBooking from '@/services/availability/useGetSlotsForBooking';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/money';
import { formatDuration } from '@/lib/duration';
import BookingClientPanel from './BookingClientPanel';
import BookingNotices from './BookingNotices';
import BookingServicePicker from './BookingServicePicker';
import BookingServicesField from './BookingServicesField';
import BookingWhenField from './BookingWhenField';
import useBookingDraft from './useBookingDraft';
import { describeReminder } from './utils/reminderStatus';
import { eligibleStaffFor } from './utils/eligibleStaff';

interface Props {
	/** Reserva a editar. `null` deja el panel cerrado. */
	appointmentId: string | null;
	/** Hoy en la zona del negocio. */
	todayKey: string;
	onClose: () => void;
	/**
	 * Se llama con lo que el backend advirtió al guardar.
	 *
	 * Las advertencias llegan con la reserva ya guardada —el panel permite
	 * registrar excepciones— así que se muestran afuera, donde queda la agenda, y
	 * no en un panel que se está cerrando.
	 */
	onSaved?: (warnings: BookingWarning[]) => void;
}

interface EditorProps {
	appointmentId: string;
	todayKey: string;
	onClose: () => void;
	onSaved?: (warnings: BookingWarning[]) => void;
}

/**
 * La reserva existente, en el mismo panel de dos columnas que la reserva nueva.
 *
 * Comparte con `NewBookingDrawer` todo lo que se ve: la columna del cliente, la
 * fecha y la hora editables en el encabezado, las filas de servicio y el
 * buscador del catálogo. No es una casualidad ni una copia — son literalmente
 * los mismos componentes. Crear y corregir una reserva son la misma pregunta con
 * distinto punto de partida, y tener dos pantallas que la hacían distinto
 * obligaba a aprender dos veces lo mismo.
 *
 * Lo que sí cambia es lo que corresponde a estar editando:
 *
 * - **El cliente es de lectura.** Cambiar de quién es una cita no es editarla:
 *   si es de otra persona, lo que va es cancelar ésta y crear la que
 *   corresponde, que es lo que deja el historial contando lo que pasó de verdad.
 * - **Los horarios excluyen a esta reserva.** Sin eso, la cita aparecería
 *   ocupándose a sí misma y correrla quince minutos sería imposible.
 * - **Hay algo que descartar.** Se guarda sobre la misma reserva, con su id y su
 *   historial, así que existe un estado "con cambios sin guardar" que en la
 *   creación no tiene sentido.
 */
const BookingEditor: React.FC<EditorProps> = ({
	appointmentId,
	todayKey,
	onClose,
	onSaved,
}) => {
	const [picking, setPicking] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);

	const { data: booking, isLoading } = useGetAppointmentDetail(appointmentId);
	const { data: services = [] } = useGetServices();
	const { data: staff = [] } = useGetStaff();
	const { data: settings } = useGetSettings();
	const { mutateAsync: save, isPending: busy } = useEditBooking();

	const timezone = booking?.timezone ?? settings?.timezone;
	// Sin configuración todavía, el código ISO es el del negocio por defecto.
	const currency = settings?.currency ?? 'BOB';
	const reminder = describeReminder(booking?.reminder ?? null);
	const segments = booking?.segments ?? [];

	const draft = useBookingDraft({ booking, services, timezone });

	/**
	 * El día que se está mirando.
	 *
	 * `null` significa "el de la reserva". Es estado propio porque al abrir el
	 * calendario y elegir otro día todavía no hay horario nuevo, y el borrador
	 * sigue apuntando al viejo: sin esto, la pantalla volvería sola al día
	 * original apenas se suelta el calendario.
	 */
	const [day, setDay] = useState<string | null>(null);
	const shownDay = day ?? draft.dayKey ?? todayKey;

	/*
	 * Con los servicios cambiados hay que revisar que la hora siga en pie: media
	 * hora más de trabajo puede no entrar antes del cierre o pisar la cita
	 * siguiente.
	 */
	const { startTimes } = useGetSlotsForBooking({
		date: draft.dayKey ?? todayKey,
		items: draft.slotItems,
		excludeAppointmentId: appointmentId,
		scope: 'panel',
		enabled:
			draft.slotItems.length > 0 && draft.servicesChanged && draft.canEdit,
	});

	const timeStillFits =
		!draft.servicesChanged ||
		(draft.startTime !== null && startTimes.includes(draft.startTime));

	/**
	 * El horario elegido pertenece al día que se está mirando.
	 *
	 * Cambiar de día sin elegir hora deja la reserva apuntando a la fecha
	 * anterior. Guardar ahí adentro escribiría el día viejo mientras el
	 * encabezado muestra el nuevo, que es la peor forma de fallar: en silencio y
	 * con la pantalla diciendo otra cosa.
	 */
	const timeMatchesDay = draft.dayKey === shownDay;

	/*
	 * `timeStillFits` no entra en `canSave` a propósito.
	 *
	 * Que el motor ya no ofrezca ese horario con los servicios nuevos no lo hace
	 * imposible: el panel puede registrar excepciones —fuera de horario, fuera de
	 * jornada, pisado— y el backend las devuelve como advertencias. Bloquear el
	 * botón obligaba a mover a un cliente que ya estaba sentado en la silla.
	 */
	const canSave =
		!busy &&
		draft.hasChanges &&
		timeMatchesDay &&
		draft.summary.unknownServiceIds.length === 0;

	const addService = (serviceId: string) => {
		const eligible = eligibleStaffFor(staff, serviceId);
		if (eligible.length === 0) return;

		// Se propone al profesional que ya está en la reserva si puede hacerlo: el
		// cliente vino a atenderse con alguien.
		const preferred =
			eligible.find((member) =>
				draft.items.some((item) => item.staffId === member.id),
			) ?? eligible[0];

		draft.setItems([...draft.items, { serviceId, staffId: preferred.id }]);
		setPicking(false);
		setSaveError(null);
	};

	const handleSave = async () => {
		if (!draft.startTime || !canSave) return;

		setSaveError(null);

		try {
			const edited = await save({
				id: appointmentId,
				payload: { startTime: draft.startTime, items: draft.items },
			});

			onSaved?.(edited.warnings);
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

	if (isLoading || !booking) {
		return (
			<div className="flex h-full items-center justify-center">
				<Spinner />
			</div>
		);
	}

	return (
		<div className="flex h-full min-h-0">
			<BookingClientPanel client={draft.client} dialCode={settings?.dialCode} />

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="border-b border-border px-5 py-4">
					{picking ? (
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label="Volver a la reserva"
								onClick={() => setPicking(false)}
							>
								<ChevronLeft className="size-4" />
							</Button>
							<h2 className="text-2xl font-semibold tracking-tight">
								Añadir un servicio
							</h2>
						</div>
					) : (
						<BookingWhenField
							dayKey={shownDay}
							onDayChange={(next) => {
								setDay(next);
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
							excludeAppointmentId={appointmentId}
							disabled={busy || !draft.canEdit}
						/>
					)}
				</header>

				<div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
					{picking ? (
						<BookingServicePicker
							services={services}
							staff={staff}
							currency={currency}
							onPick={addService}
							pickedIds={draft.items.map((item) => item.serviceId)}
						/>
					) : (
						<div className="space-y-5">
							<BookingServicesField
								items={draft.items}
								onChange={(next) => {
									draft.setItems(next);
									setSaveError(null);
								}}
								services={services}
								staff={staff}
								currency={currency}
								offsets={draft.offsets}
								startTime={draft.startTime}
								timezone={timezone}
								editable={draft.canEdit}
								segments={segments}
								onAddRequest={() => setPicking(true)}
								disabled={busy}
								notices={
									<BookingNotices
										hasInactiveService={
											draft.summary.unknownServiceIds.length > 0
										}
										timeNoLongerFits={draft.servicesChanged && !timeStillFits}
										pendingChanges={draft.hasChanges && timeStillFits}
										locked={!draft.canEdit && segments.length > 0}
									/>
								}
							/>

							{!timeMatchesDay && (
								<p className="text-sm text-amber-600 dark:text-amber-500">
									Cambiaste el día. Elegí una hora para poder guardar.
								</p>
							)}

							{reminder && (
								<p
									className={cn(
										'border-t border-border pt-4 text-xs',
										reminder.tone === 'warning'
											? 'text-amber-600 dark:text-amber-500'
											: 'text-muted-foreground',
									)}
								>
									{reminder.label}
								</p>
							)}

							{saveError && (
								<p className="rounded-md border border-red-500/50 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
									{saveError}
								</p>
							)}
						</div>
					)}
				</div>

				<footer className="flex items-center justify-between gap-4 border-t border-border px-5 py-3">
					<div>
						<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
							Total
						</p>
						<p className="text-xl font-semibold tabular-nums">
							{formatMoney(
								draft.hasChanges
									? draft.summary.totalPrice
									: (booking.totalPrice ?? 0),
								currency,
							)}
						</p>
						<p className="text-xs tabular-nums text-muted-foreground">
							{formatDuration(
								draft.hasChanges
									? draft.summary.totalMinutes
									: (booking.totalDuration ?? 0),
							)}
						</p>
					</div>

					{draft.hasChanges ? (
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								disabled={busy}
								onClick={() => {
									draft.discard();
									setDay(null);
									setSaveError(null);
								}}
							>
								Descartar
							</Button>
							<Button
								size="lg"
								disabled={!canSave}
								onClick={() => void handleSave()}
							>
								{busy && <Spinner className="size-3.5" />}
								Guardar cambios
							</Button>
						</div>
					) : (
						<Button variant="outline" onClick={onClose}>
							Cerrar
						</Button>
					)}
				</footer>
			</div>
		</div>
	);
};

/**
 * El panel lateral de una reserva existente.
 *
 * El editor se monta con la reserva como clave: lo que quedó a medio cambiar
 * pertenece a *esa* reserva y muere con ella, sin necesidad de limpiarlo a mano
 * al cerrar ni al abrir otra.
 */
const BookingDrawer: React.FC<Props> = ({
	appointmentId,
	todayKey,
	onClose,
	onSaved,
}) => (
	<Drawer
		direction="right"
		open={appointmentId !== null}
		onOpenChange={(next) => {
			if (!next) onClose();
		}}
	>
		{/*
		 * El ancho va con la variante de vaul y no con un `sm:max-w-*` suelto: la
		 * clase propia de `DrawerContent` lleva un selector de atributo y le gana a
		 * cualquier `max-w` plano. El mismo que la reserva nueva: es la misma
		 * pantalla con otro punto de partida.
		 */}
		<DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-2xl">
			{/*
			 * El título va sólo para el lector de pantalla: en la pantalla ya lo dice
			 * el encabezado con la fecha. Pero el diálogo necesita uno, o a quien
			 * navega por voz se le abre un panel sin nombre.
			 */}
			<DrawerHeader className="sr-only">
				<DrawerTitle>Editar reserva</DrawerTitle>
				<DrawerDescription>
					Cambiá el horario o los servicios de esta cita.
				</DrawerDescription>
			</DrawerHeader>

			{appointmentId !== null && (
				<BookingEditor
					key={appointmentId}
					appointmentId={appointmentId}
					todayKey={todayKey}
					onClose={onClose}
					onSaved={onSaved}
				/>
			)}
		</DrawerContent>
	</Drawer>
);

export default BookingDrawer;
