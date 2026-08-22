'use client';

import { useMemo, useState } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight, Clock, Scissors, User } from 'lucide-react';
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
import useGetSlotsForBooking, {
	type BookingSlotItem,
} from '@/services/availability/useGetSlotsForBooking';
import { cn } from '@/lib/utils';
import BookingTimeStep from './BookingTimeStep';
import BookingServicesEditor from './BookingServicesEditor';
import {
	itemsChanged,
	offsetsOf,
	summarizeDraft,
	toDraftItems,
	type DraftItem,
} from './utils/bookingDraft';
import { describeReminder } from './utils/reminderStatus';
import { describeDay } from './utils/calendarLabels';
import {
	dateKeyInTimeZone,
	formatMinute,
	minutesInTimeZone,
} from './utils/calendarLayout';

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
 * La reserva completa, en un panel lateral, con su fecha y hora editables.
 *
 * Muestra lo que la card no tiene ancho para decir: el teléfono del cliente, el
 * profesional y el precio de **cada** servicio, y cómo se reparte la hora entre
 * los tramos. Una reserva de dos servicios con dos profesionales se lee tal como
 * está guardada, sin resumirla en un "Varios".
 *
 * Editar es editar: se guarda sobre la misma reserva, con su mismo id e
 * historial. El cliente se muestra y no se toca —cambiar de quién es la cita no
 * es editarla— y los servicios entran en el paso siguiente.
 */
const BookingEditor: React.FC<EditorProps> = ({
	appointmentId,
	todayKey,
	onClose,
}) => {
	const [view, setView] = useState<'detail' | 'time'>('detail');
	/** Inicio elegido y todavía sin guardar. */
	const [draftStart, setDraftStart] = useState<string | null>(null);
	/** Día que se está mirando en el paso de horarios. */
	const [pickerDate, setPickerDate] = useState<string | null>(null);
	const [saveError, setSaveError] = useState<string | null>(null);

	/** Servicios elegidos y todavía sin guardar. `null` es "como está guardado". */
	const [draftItems, setDraftItems] = useState<DraftItem[] | null>(null);

	const { data: booking, isLoading } = useGetAppointmentDetail(appointmentId);
	const { data: services = [] } = useGetServices();
	const { data: staff = [] } = useGetStaff();
	const { mutateAsync: save, isPending: isSaving } = useEditBooking();

	const timezone = booking?.timezone;
	const reminder = describeReminder(booking?.reminder ?? null);
	// Memoizado porque alimenta el cálculo de los tramos: `?? []` crearía un
	// array nuevo en cada render y recalcularía todo sin que nada cambie.
	const segments = useMemo(() => booking?.segments ?? [], [booking?.segments]);

	const startTime = draftStart ?? booking?.startTime ?? null;
	const timeChanged = draftStart !== null && draftStart !== booking?.startTime;

	const dayKey = startTime ? dateKeyInTimeZone(startTime, timezone) : null;

	const savedItems = useMemo(() => toDraftItems(segments), [segments]);
	const items = draftItems ?? savedItems;
	const servicesChanged = itemsChanged(savedItems, items);

	/** Precio ya pactado de cada servicio que la reserva ya tenía. */
	const agreedPrices = useMemo(
		() =>
			new Map(segments.map((segment) => [segment.serviceId, segment.price])),
		[segments],
	);

	const offsets = useMemo(
		() => offsetsOf({ items, services }),
		[items, services],
	);

	const summary = useMemo(
		() => summarizeDraft({ items, services, agreedPrices }),
		[items, services, agreedPrices],
	);

	/**
	 * Los tramos con su desplazamiento, para preguntar disponibilidad.
	 *
	 * La duración es la **vigente** del servicio y no la que se guardó al
	 * reservar: es la que va a usar el backend para reacomodar los tramos, y con
	 * la vieja se ofrecerían horarios que después rechaza.
	 */
	const slotItems = useMemo<BookingSlotItem[]>(
		() =>
			items.map((item, index) => ({
				serviceId: item.serviceId,
				staffId: item.staffId,
				offsetMinutes: offsets[index] ?? 0,
			})),
		[items, offsets],
	);

	/** Un tramo sin profesional no se puede replanificar sin inventar datos. */
	const canEdit = segments.length > 0 && savedItems.length === segments.length;

	/*
	 * Con los servicios cambiados hay que revisar que la hora siga en pie: media
	 * hora más de trabajo puede no entrar antes del cierre o pisar la cita
	 * siguiente. Se pregunta al motor por el día que se está mirando.
	 */
	const { startTimes } = useGetSlotsForBooking({
		date: dayKey ?? todayKey,
		items: slotItems,
		excludeAppointmentId: appointmentId,
		enabled: servicesChanged && canEdit,
	});

	const timeStillFits =
		!servicesChanged || (startTime !== null && startTimes.includes(startTime));

	const hasChanges = timeChanged || servicesChanged;

	const handleSave = async () => {
		if (!booking || !startTime || !hasChanges) return;

		setSaveError(null);

		try {
			await save({
				id: appointmentId,
				payload: {
					startTime,
					items: items.map((item) => ({
						serviceId: item.serviceId,
						staffId: item.staffId,
					})),
				},
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
						date={pickerDate ?? dayKey ?? todayKey}
						onDateChange={setPickerDate}
						todayKey={todayKey}
						timezone={timezone}
						items={slotItems}
						excludeAppointmentId={booking.id}
						selected={draftStart}
						onSelect={(next) => {
							setDraftStart(next);
							setSaveError(null);
							setView('detail');
						}}
					/>
				</div>
			) : (
				<div className="flex-1 space-y-5 overflow-y-auto p-4">
					{/* Fecha y hora: la única parte editable por ahora. */}
					<button
						type="button"
						disabled={!canEdit}
						onClick={() => {
							setPickerDate(dayKey);
							setView('time');
						}}
						className={cn(
							'flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors',
							canEdit ? 'hover:bg-muted/60' : 'cursor-default',
						)}
					>
						<span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
							<Clock className="h-4 w-4 text-muted-foreground" />
						</span>
						<div className="min-w-0 flex-1">
							<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
								Fecha y hora
							</p>
							<p className="text-sm font-medium">
								{dayKey ? describeDay(dayKey) : 'Sin fecha'} ·{' '}
								{timeIn(startTime ?? '', timezone)}
							</p>
							<p className="text-xs text-muted-foreground">
								{hasChanges
									? 'Sin guardar'
									: `Termina ${timeIn(booking.endTime ?? '', timezone)} · ${booking.totalDuration} min en total`}
							</p>
						</div>
						{canEdit && (
							<ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
						)}
					</button>

					{/* Cliente, en lectura: cambiar de quién es la cita no es editarla. */}
					<div className="flex items-start gap-3 p-2">
						<span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
							<User className="h-4 w-4 text-muted-foreground" />
						</span>
						<div className="min-w-0">
							<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
								Cliente
							</p>
							<p className="truncate text-sm font-medium">
								{booking.client?.name ?? booking.clientName ?? 'Sin cliente'}
							</p>
							<p className="text-xs text-muted-foreground">
								{booking.client?.phone ?? 'Sin teléfono'}
							</p>
						</div>
					</div>

					{/* Servicios: uno por tramo, cada uno con su profesional. */}
					<div className="space-y-2 px-2">
						<p className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
							<Scissors className="h-3 w-3" />
							Servicios · {items.length}
						</p>

						{canEdit ? (
							<BookingServicesEditor
								items={items}
								onChange={(next) => {
									setDraftItems(next);
									setSaveError(null);
								}}
								services={services}
								staff={staff}
								offsets={offsets}
								startMinute={
									startTime ? minutesInTimeZone(startTime, timezone) : null
								}
								disabled={isSaving}
							/>
						) : (
							/*
							 * Sin profesional en algún tramo no se puede replanificar sin
							 * inventar datos, así que la reserva se muestra como está.
							 */
							<ul className="space-y-2">
								{segments.map((segment, index) => (
									<li
										key={`${segment.serviceId}-${index}`}
										className="flex items-center gap-3"
									>
										<span className="w-11 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
											{timeIn(segment.startTime, timezone)}
										</span>
										<div className="min-w-0 flex-1 rounded-lg border border-border bg-card p-3">
											<p className="truncate text-sm font-medium">
												{segment.serviceName ?? 'Servicio'}
											</p>
											<p className="truncate text-xs text-muted-foreground">
												{segment.durationMinutes} min ·{' '}
												{segment.staffName ?? 'Sin profesional'}
											</p>
										</div>
									</li>
								))}
							</ul>
						)}

						{summary.unknownServiceIds.length > 0 && (
							<p className="text-xs text-amber-600 dark:text-amber-500">
								Hay un servicio de esta reserva que ya no está activo. Para
								guardar cambios hay que quitarlo.
							</p>
						)}

						{servicesChanged && !timeStillFits && (
							<p className="text-xs text-amber-600 dark:text-amber-500">
								Con estos servicios ese horario ya no entra. Elegí otra hora
								para poder guardar.
							</p>
						)}

						{hasChanges && timeStillFits && (
							<p className="text-xs text-muted-foreground">
								Las horas de cada servicio se reacomodan al guardar.
							</p>
						)}

						{!canEdit && segments.length > 0 && (
							<p className="text-xs text-amber-600 dark:text-amber-500">
								Esta reserva tiene un servicio sin profesional asignado, así que
								no se puede editar desde acá.
							</p>
						)}
					</div>

					<div className="space-y-1 border-t border-border px-2 pt-4">
						{reminder && (
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
						)}
					</div>

					{saveError && (
						<p className="rounded-md border border-red-500/50 bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-400">
							{saveError}
						</p>
					)}
				</div>
			)}

			{view === 'detail' && (
				<DrawerFooter className="flex-row items-center justify-between border-t border-border">
					<div className="text-sm">
						<span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
							Total ·{' '}
							{hasChanges
								? summary.totalMinutes
								: (booking?.totalDuration ?? 0)}{' '}
							min
						</span>
						<p className="text-base font-semibold tabular-nums">
							{hasChanges ? summary.totalPrice : (booking?.totalPrice ?? 0)}
						</p>
					</div>

					{hasChanges ? (
						<div className="flex items-center gap-2">
							<Button
								variant="ghost"
								disabled={isSaving}
								onClick={() => {
									setDraftStart(null);
									setDraftItems(null);
									setSaveError(null);
								}}
							>
								Descartar
							</Button>
							<Button
								/*
								 * No se ofrece guardar lo que el backend va a rechazar: si con los
								 * servicios nuevos la hora ya no entra, primero hay que elegir otra.
								 */
								disabled={
									isSaving ||
									!timeStillFits ||
									summary.unknownServiceIds.length > 0
								}
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
