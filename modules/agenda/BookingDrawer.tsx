'use client';

import { useState } from 'react';
import axios from 'axios';
import { Check, ChevronLeft } from 'lucide-react';
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
import useDeleteBooking from '@/services/appointments/useDeleteBooking';
import useUpdateAppointmentStatus from '@/services/appointments/useUpdateAppointmentStatus';
import useGetSettings from '@/services/settings/useGetSettings';
import type { BookingWarning } from '@/services/appointments/appointments.service';
import useGetServices from '@/services/services/useGetServices';
import useGetStaff from '@/services/staff/useGetStaff';
import useGetSlotsForBooking from '@/services/availability/useGetSlotsForBooking';
import { cn } from '@/lib/utils';
import { countUnpriced, formatTotals } from '@/lib/money';
import { formatDuration } from '@/lib/duration';
import AppointmentConfirmDialog, {
	type ConfirmingAction,
} from './AppointmentConfirmDialog';
import BookingActionsMenu from './BookingActionsMenu';
import BookingClientPanel from './BookingClientPanel';
import BookingMobileBar from './BookingMobileBar';
import BookingNotices from './BookingNotices';
import BookingServicePicker from './BookingServicePicker';
import BookingServicesField from './BookingServicesField';
import BookingWhenField from './BookingWhenField';
import useBookingDraft from './useBookingDraft';
import FinishWithPricesDialog, {
	useFinishWithPrices,
} from './FinishWithPricesDialog';
import { getAppointmentStatusText } from '@/modules/appointments/utils/constants';
import { formatMinute, minutesInTimeZone } from './utils/calendarLayout';
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
	/**
	 * Lo guardado, para que la agenda pueda reaccionar.
	 *
	 * El día viaja además de los avisos porque la fecha se puede cambiar acá
	 * adentro: guardada para otro día, la cita queda fuera de lo que se está
	 * mirando y el cambio parece no haber pasado.
	 */
	onSaved?: (warnings: BookingWarning[], dayKey: string | null) => void;
}

interface EditorProps {
	appointmentId: string;
	todayKey: string;
	onClose: () => void;
	onSaved?: (warnings: BookingWarning[], dayKey: string | null) => void;
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
 * - **Hay algo que deshacer.** Una reserva que existe se puede cancelar o
 *   eliminar, y eso no tiene equivalente al crearla: ver `BookingActionsMenu`.
 */
const BookingEditor: React.FC<EditorProps> = ({
	appointmentId,
	todayKey,
	onClose,
	onSaved,
}) => {
	const [picking, setPicking] = useState(false);
	const [saveError, setSaveError] = useState<string | null>(null);
	const [confirming, setConfirming] = useState<ConfirmingAction>(null);

	const { data: booking, isLoading } = useGetAppointmentDetail(appointmentId);
	const { data: services = [] } = useGetServices();
	const { data: staff = [] } = useGetStaff();
	const { data: settings } = useGetSettings();
	const { mutateAsync: save, isPending: saving } = useEditBooking();
	const { mutate: updateStatus, isPending: cancelling } =
		useUpdateAppointmentStatus();
	const { mutate: deleteBooking, isPending: deleting } = useDeleteBooking();

	/*
	 * Finalizar puede abrir una pregunta antes: si la cita tiene servicios que se
	 * cotizan, el precio se escribe acá, que es cuando se sabe. La decisión vive en
	 * el hook para que las tres puertas que finalizan una cita —esta, el menú de la
	 * tarjeta y la cola de citas sin cerrar— se comporten igual.
	 */
	const { requestFinish, finishingId, dialogProps } = useFinishWithPrices({
		onFinished: onClose,
		onError: setSaveError,
	});
	const finishing = finishingId !== null;

	const busy = saving || finishing || cancelling || deleting;

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

	/**
	 * Estados en los que la cita todavía espera una resolución.
	 *
	 * Sólo ahí tiene sentido ofrecer "Finalizar": una atendida ya lo está, y una
	 * cancelada no se resuelve marcándola como atendida.
	 */
	const isPendingResolution =
		booking?.status === 'pending' || booking?.status === 'confirmed';

	const handleFinish = () => {
		if (!booking) return;

		setSaveError(null);
		requestFinish({
			id: appointmentId,
			clientName: booking.client?.name ?? booking.clientName ?? null,
			segments,
		});
	};

	/*
	 * Cancelar y eliminar cierran el panel.
	 *
	 * Las dos resuelven la reserva, así que no queda nada que editar acá adentro:
	 * dejar el panel abierto sobre una cita que ya no existe —o que ya está
	 * cancelada— era mostrar un formulario que no lleva a ninguna parte. Lo que
	 * pasó se ve atrás, en la agenda, que es donde la tarjeta desaparece o queda
	 * tachada.
	 *
	 * El error, en cambio, mantiene el panel abierto y lo escribe donde ya se
	 * escriben los de guardar: cerrar sin haber hecho nada se lee como que salió
	 * bien.
	 */
	const handleCancelBooking = () => {
		setSaveError(null);

		updateStatus(
			{ id: appointmentId, status: 'cancelled' },
			{
				onSuccess: () => onClose(),
				onError: () =>
					setSaveError('No se pudo cancelar la cita. Intentá de nuevo.'),
			},
		);
	};

	const handleDeleteBooking = () => {
		setSaveError(null);

		deleteBooking(appointmentId, {
			onSuccess: () => onClose(),
			onError: () =>
				setSaveError('No se pudo eliminar la reserva. Intentá de nuevo.'),
		});
	};

	const handleSave = async () => {
		if (!draft.startTime || !canSave) return;

		setSaveError(null);

		try {
			const edited = await save({
				id: appointmentId,
				payload: { startTime: draft.startTime, items: draft.items },
			});

			onSaved?.(edited.warnings, draft.dayKey);
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
			<div className="flex flex-1 items-center justify-center">
				<Spinner />
			</div>
		);
	}

	/**
	 * La hora guardada de la reserva, para el aviso de cancelar.
	 *
	 * La del borrador no sirve: se puede haber movido sin guardar, y cancelar
	 * cancela la cita que está en la agenda, no la que se estaba armando. Decir la
	 * otra hora habría hecho dudar de qué se está por cancelar.
	 */
	const savedMinute = booking.startTime
		? minutesInTimeZone(booking.startTime, timezone)
		: null;

	return (
		/*
		 * Dos columnas desde `sm`; en móvil, todo apilado. El `relative` es para el
		 * buscador de clientes de la reserva nueva, que se abre encima del
		 * formulario: acá el cliente es de lectura, pero la columna es el mismo
		 * componente y la referencia tiene que existir igual.
		 *
		 * El orden de lo apilado no es el del código: en móvil la columna de la
		 * derecha es `contents`, así que sus hijos son hijos de este mismo flex y
		 * el `order` de cada uno los intercala con la tarjeta del cliente.
		 */
		<div className="relative flex min-h-0 flex-1 flex-col sm:flex-row">
			{/*
			 * Eligiendo servicio, la tarjeta del cliente va arriba de la lista: es de
			 * quién es la reserva a la que se le está agregando algo. Mirando la
			 * reserva, va abajo de la fecha, que es lo que la define.
			 */}
			<BookingClientPanel
				client={draft.client}
				dialCode={settings?.dialCode}
				className={cn('sm:order-1', picking ? 'order-1' : 'order-2')}
			/>

			<div className="contents sm:order-2 sm:flex sm:min-h-0 sm:min-w-0 sm:flex-1 sm:flex-col">
				<header
					className={cn(
						'border-b border-border px-4 py-3 sm:order-1 sm:px-5 sm:py-4',
						picking ? 'order-2' : 'order-1',
					)}
				>
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
							<h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
								Añadir un servicio
							</h2>
						</div>
					) : (
						<div className="flex items-start justify-between gap-3">
							<div className="min-w-0 flex-1">
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
							</div>

							<BookingActionsMenu
								status={booking.status}
								disabled={busy}
								onRequestCancel={() => setConfirming('cancel')}
								onRequestDelete={() => setConfirming('delete')}
							/>
						</div>
					)}
				</header>

				<div className="order-3 min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-5">
					{picking ? (
						<BookingServicePicker
							services={services}
							staff={staff}
							onPick={addService}
							pickedIds={draft.items.map((item) => item.serviceId)}
							preferredStaffId={draft.items[0]?.staffId ?? null}
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
								prices={draft.prices}
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
								<p className="text-sm text-warning">
									Cambiaste el día. Elegí una hora para poder guardar.
								</p>
							)}

							{reminder && (
								<p
									className={cn(
										'border-t border-border pt-4 text-xs',
										reminder.tone === 'warning'
											? 'text-warning'
											: 'text-muted-foreground',
									)}
								>
									{reminder.label}
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
				 * repartían el ancho hasta que "Finalizar" quedaba más angosto que su
				 * propia palabra —que era, justamente, el botón por el que se abre este
				 * panel—. El `env(safe-area-inset-bottom)` es para que no termine abajo
				 * del indicador de home.
				 */}
				<footer className="order-4 flex flex-col gap-3 border-t border-border px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-5 sm:pb-3">
					<div className="flex items-baseline justify-between gap-4 sm:block">
						<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
							Total
						</p>
						<div className="flex items-baseline gap-2 sm:block">
							<p className="text-xl font-semibold tabular-nums">
								{formatTotals(
									draft.hasChanges
										? draft.summary.totals
										: (booking.totals ?? []),
									currency,
									draft.hasChanges
										? draft.summary.unpriced
										: countUnpriced(segments),
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
								className="flex-1 sm:flex-none"
								disabled={!canSave}
								onClick={() => void handleSave()}
							>
								{busy && <Spinner className="size-3.5" />}
								Guardar cambios
							</Button>
						</div>
					) : (
						<div className="flex items-center gap-2 max-sm:justify-between">
							{/*
							 * Finalizar vive acá y no en un menú aparte porque es lo que se
							 * viene a hacer: se abre la cita del cliente que está sentado en
							 * la silla, se corrige algo si hace falta, y se cierra. Antes
							 * había que salir del panel y buscar la acción en el menú del
							 * click derecho.
							 *
							 * No aparece con cambios sin guardar: ahí "finalizar" no dice si
							 * los guarda o los tira, y una acción que resuelve una cita no
							 * puede ser ambigua. Primero se guarda o se descarta.
							 */}
							{isPendingResolution ? (
								/*
								 * Se queda con el ancho que sobra en móvil: es lo que se viene
								 * a hacer acá y lo que se toca con el pulgar. "Cerrar" no lo
								 * necesita —además está la "X" de arriba—.
								 */
								<Button
									size="lg"
									className="flex-1 sm:flex-none"
									disabled={busy}
									onClick={handleFinish}
								>
									{finishing ? (
										<Spinner className="size-3.5" />
									) : (
										<Check className="size-4" />
									)}
									Finalizar
								</Button>
							) : (
								<span className="text-sm text-muted-foreground">
									{getAppointmentStatusText(booking.status)}
								</span>
							)}

							<Button variant="outline" onClick={onClose}>
								Cerrar
							</Button>
						</div>
					)}
				</footer>
			</div>

			{/*
			 * Fuera del panel que hace scroll: el diálogo se dibuja en su propio
			 * portal, y anidarlo adentro lo dejaría atado al alto del contenido.
			 */}
			<FinishWithPricesDialog {...dialogProps} />

			<AppointmentConfirmDialog
				clientName={booking.client?.name ?? booking.clientName ?? null}
				timeLabel={savedMinute === null ? null : formatMinute(savedMinute)}
				action={confirming}
				onOpenChange={(open) => {
					if (!open) setConfirming(null);
				}}
				onCancel={handleCancelBooking}
				onDelete={handleDeleteBooking}
			/>
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

			<BookingMobileBar title="Reserva" onClose={onClose} />

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
