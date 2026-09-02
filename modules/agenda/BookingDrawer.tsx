'use client';

import { useState } from 'react';
import axios from 'axios';
import { ChevronLeft } from 'lucide-react';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerFooter,
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
import BookingClientField from './BookingClientField';
import BookingDateTimeField from './BookingDateTimeField';
import BookingNotices from './BookingNotices';
import BookingServicesField from './BookingServicesField';
import BookingSummary from './BookingSummary';
import BookingTimeStep from './BookingTimeStep';
import useBookingDraft from './useBookingDraft';
import { describeReminder } from './utils/reminderStatus';
import { formatMinute, minutesInTimeZone } from './utils/calendarLayout';

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

/** La hora de un instante, en la zona del negocio. */
const timeIn = (iso: string, timezone?: string): string => {
	const minute = minutesInTimeZone(iso, timezone);
	return minute === null ? '--:--' : formatMinute(minute);
};

/**
 * La reserva completa, en un panel lateral, editable.
 *
 * Este componente orquesta: sostiene la vista abierta, el guardado y los avisos.
 * Las cuentas del borrador viven en `useBookingDraft` y cada campo en su propio
 * componente.
 *
 * Editar es editar: se guarda sobre la misma reserva, con su mismo id e
 * historial. Crear una reserva nueva es otra pantalla —`NewBookingDrawer`—
 * porque es otra forma: allá hay un primer paso, acá está todo elegido y lo que
 * se hace es corregirlo. Las cuentas las siguen compartiendo.
 */
const BookingEditor: React.FC<EditorProps> = ({
	appointmentId,
	todayKey,
	onClose,
	onSaved,
}) => {
	const [view, setView] = useState<'detail' | 'time'>('detail');
	/** Día que se está mirando en el paso de horarios. */
	const [pickerDate, setPickerDate] = useState<string | null>(null);
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

	/*
	 * Con los servicios cambiados hay que revisar que la hora siga en pie: media
	 * hora más de trabajo puede no entrar antes del cierre o pisar la cita
	 * siguiente. Se pregunta al motor por el día que se está mirando.
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

	/*
	 * `timeStillFits` no entra en `canSave` a propósito.
	 *
	 * Que el motor ya no ofrezca ese horario con los servicios nuevos no lo hace
	 * imposible: el panel puede registrar excepciones —fuera de horario, fuera de
	 * jornada, pisado— y el backend las devuelve como advertencias. Bloquear el
	 * botón obligaba a mover a un cliente que ya estaba sentado en la silla.
	 */
	const canSave =
		!busy && draft.hasChanges && draft.summary.unknownServiceIds.length === 0;

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

	return (
		<>
			<DrawerHeader className="border-b border-border">
				{view === 'time' ? (
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="Volver a la reserva"
							onClick={() => setView('detail')}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<div>
							<DrawerDescription className="font-mono text-[10px] tracking-widest uppercase">
								Reserva · Hora
							</DrawerDescription>
							<DrawerTitle className="text-lg">Seleccioná una hora</DrawerTitle>
						</div>
					</div>
				) : (
					<>
						<DrawerDescription className="font-mono text-[10px] tracking-widest uppercase">
							Reserva
						</DrawerDescription>
						<DrawerTitle className="text-lg">Editar reserva</DrawerTitle>
					</>
				)}
			</DrawerHeader>

			{isLoading || !booking ? (
				<div className="flex flex-1 items-center justify-center">
					<Spinner />
				</div>
			) : view === 'time' ? (
				<div className="flex-1 overflow-y-auto p-4">
					<BookingTimeStep
						date={pickerDate ?? draft.dayKey ?? todayKey}
						onDateChange={setPickerDate}
						todayKey={todayKey}
						timezone={timezone}
						items={draft.slotItems}
						totalMinutes={draft.summary.totalMinutes}
						excludeAppointmentId={appointmentId}
						selected={draft.startTime}
						onSelect={(next) => {
							draft.setStartTime(next);
							setSaveError(null);
							setView('detail');
						}}
					/>
				</div>
			) : (
				<div className="flex-1 overflow-y-auto p-4">
					{/*
					 * Dos columnas: el cliente al lado, no encima. De quién es la cita se
					 * lee de un vistazo mientras se corrigen los servicios, que es lo que
					 * se viene a hacer acá.
					 */}
					<div className="grid gap-5 sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)]">
						<BookingClientField
							client={draft.client}
							dialCode={settings?.dialCode}
						/>

						<div className="space-y-5">
							<BookingDateTimeField
								dayKey={draft.dayKey}
								time={timeIn(draft.startTime ?? '', timezone)}
								detail={
									draft.hasChanges
										? 'Sin guardar'
										: `Termina ${timeIn(booking.endTime ?? '', timezone)} · ${booking.totalDuration ?? 0} min en total`
								}
								editable={draft.canEdit}
								onOpen={() => {
									setPickerDate(draft.dayKey ?? todayKey);
									setView('time');
								}}
							/>

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

							{reminder && (
								<div className="border-t border-border px-2 pt-4">
									<p
										className={cn(
											'text-xs',
											reminder.tone === 'warning'
												? 'text-amber-600 dark:text-amber-500'
												: 'text-muted-foreground',
										)}
									>
										{reminder.label}
									</p>
								</div>
							)}

							{saveError && (
								<p className="rounded-md border border-red-500/50 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
									{saveError}
								</p>
							)}
						</div>
					</div>
				</div>
			)}

			{view === 'detail' && (
				<DrawerFooter className="flex-row items-center justify-between border-t border-border">
					<BookingSummary
						currency={currency}
						totalMinutes={
							draft.hasChanges
								? draft.summary.totalMinutes
								: (booking?.totalDuration ?? 0)
						}
						totalPrice={
							draft.hasChanges
								? draft.summary.totalPrice
								: (booking?.totalPrice ?? 0)
						}
					/>

					{draft.hasChanges ? (
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								disabled={busy}
								onClick={() => {
									draft.discard();
									setSaveError(null);
								}}
							>
								Descartar
							</Button>
							<Button disabled={!canSave} onClick={() => void handleSave()}>
								{busy ? 'Guardando...' : 'Guardar cambios'}
							</Button>
						</div>
					) : (
						<Button variant="outline" onClick={onClose}>
							Cerrar
						</Button>
					)}
				</DrawerFooter>
			)}
		</>
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
		 * cualquier `max-w` plano. Con dos columnas eso se nota enseguida.
		 */}
		<DrawerContent className="data-[vaul-drawer-direction=right]:sm:max-w-2xl">
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
