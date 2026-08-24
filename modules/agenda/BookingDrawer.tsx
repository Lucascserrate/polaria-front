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
	/** Reserva abierta. `null` mantiene el drawer montado y cerrado. */
	appointmentId: string | null;
	/** Hoy en la zona del negocio. */
	todayKey: string;
	onClose: () => void;
}

interface EditorProps {
	appointmentId: string;
	todayKey: string;
	onClose: () => void;
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
 * componente, porque lo que sigue —crear una reserva desde acá— es el mismo
 * formulario con otro punto de partida, y un archivo que mezcle las dos cosas se
 * vuelve imposible de leer.
 *
 * Editar es editar: se guarda sobre la misma reserva, con su mismo id e
 * historial.
 */
const BookingEditor: React.FC<EditorProps> = ({
	appointmentId,
	todayKey,
	onClose,
}) => {
	const [view, setView] = useState<'detail' | 'time'>('detail');
	/** Día que se está mirando en el paso de horarios. */
	const [pickerDate, setPickerDate] = useState<string | null>(null);
	const [saveError, setSaveError] = useState<string | null>(null);

	const { data: booking, isLoading } = useGetAppointmentDetail(appointmentId);
	const { data: services = [] } = useGetServices();
	const { data: staff = [] } = useGetStaff();
	const { mutateAsync: save, isPending: isSaving } = useEditBooking();

	const timezone = booking?.timezone;
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
		enabled: draft.servicesChanged && draft.canEdit,
	});

	const timeStillFits =
		!draft.servicesChanged ||
		(draft.startTime !== null && startTimes.includes(draft.startTime));

	const canSave =
		!isSaving && timeStillFits && draft.summary.unknownServiceIds.length === 0;

	const handleSave = async () => {
		if (!booking || !draft.startTime || !draft.hasChanges) return;

		setSaveError(null);

		try {
			await save({
				id: appointmentId,
				payload: { startTime: draft.startTime, items: draft.items },
			});
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
						excludeAppointmentId={booking.id}
						selected={draft.startTime}
						onSelect={(next) => {
							draft.setStartTime(next);
							setSaveError(null);
							setView('detail');
						}}
					/>
				</div>
			) : (
				<div className="flex-1 space-y-5 overflow-y-auto p-4">
					<BookingDateTimeField
						dayKey={draft.dayKey}
						time={timeIn(draft.startTime ?? '', timezone)}
						detail={
							draft.hasChanges
								? 'Sin guardar'
								: `Termina ${timeIn(booking.endTime ?? '', timezone)} · ${booking.totalDuration} min en total`
						}
						editable={draft.canEdit}
						onOpen={() => {
							setPickerDate(draft.dayKey);
							setView('time');
						}}
					/>

					<BookingClientField
						name={booking.client?.name ?? booking.clientName ?? null}
						phone={booking.client?.phone ?? null}
					/>

					<BookingServicesField
						items={draft.items}
						onChange={(next) => {
							draft.setItems(next);
							setSaveError(null);
						}}
						services={services}
						staff={staff}
						offsets={draft.offsets}
						startTime={draft.startTime}
						timezone={timezone}
						editable={draft.canEdit}
						segments={segments}
						disabled={isSaving}
						notices={
							<BookingNotices
								hasInactiveService={draft.summary.unknownServiceIds.length > 0}
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
			)}

			{view === 'detail' && (
				<DrawerFooter className="flex-row items-center justify-between border-t border-border">
					<BookingSummary
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
								disabled={isSaving}
								onClick={() => {
									draft.discard();
									setSaveError(null);
								}}
							>
								Descartar
							</Button>
							<Button
								/*
								 * No se ofrece guardar lo que el backend va a rechazar: si con
								 * los servicios nuevos la hora ya no entra, primero hay que
								 * elegir otra.
								 */
								disabled={!canSave}
								onClick={() => void handleSave()}
							>
								{isSaving ? 'Guardando...' : 'Guardar cambios'}
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
 * El panel lateral de una reserva.
 *
 * El editor se monta con la reserva como clave: lo que quedó a medio elegir
 * pertenece a *esa* reserva y muere con ella, sin necesidad de limpiarlo a mano
 * al cerrar ni al abrir otra.
 */
const BookingDrawer: React.FC<Props> = ({
	appointmentId,
	todayKey,
	onClose,
}) => (
	<Drawer
		direction="right"
		open={appointmentId !== null}
		onOpenChange={(next) => {
			if (!next) onClose();
		}}
	>
		<DrawerContent className="sm:max-w-md">
			{appointmentId !== null && (
				<BookingEditor
					key={appointmentId}
					appointmentId={appointmentId}
					todayKey={todayKey}
					onClose={onClose}
				/>
			)}
		</DrawerContent>
	</Drawer>
);

export default BookingDrawer;
