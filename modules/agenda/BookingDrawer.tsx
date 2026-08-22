'use client';

import { Clock, Scissors, User } from 'lucide-react';
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
import {
	getAppointmentStatusText,
	STATUS_COLORS,
} from '@/modules/appointments/utils/constants';
import useGetAppointmentDetail from '@/services/appointments/useGetAppointmentDetail';
import { cn } from '@/lib/utils';
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
	onClose: () => void;
}

/** La hora de un instante, en la zona del negocio. */
const timeIn = (iso: string, timezone?: string): string => {
	const minute = minutesInTimeZone(iso, timezone);
	return minute === null ? '--:--' : formatMinute(minute);
};

/**
 * La reserva completa, en un panel lateral.
 *
 * Muestra lo que la card no tiene ancho para decir: el teléfono del cliente, el
 * profesional y el precio de **cada** servicio, y cómo se reparte la hora entre
 * los tramos. Una reserva de dos servicios con dos profesionales se lee tal como
 * está guardada, sin resumirla en un "Varios".
 *
 * Por ahora es lectura. La edición de fecha, hora y servicios entra en los pasos
 * siguientes, sobre este mismo panel y contra el endpoint que ya la resuelve.
 */
const BookingDrawer: React.FC<Props> = ({ appointmentId, onClose }) => {
	const { data: booking, isLoading } = useGetAppointmentDetail(appointmentId);

	const timezone = booking?.timezone;
	const status = booking?.status ?? 'confirmed';
	const colors = STATUS_COLORS[status] ?? STATUS_COLORS.confirmed;
	const reminder = describeReminder(booking?.reminder ?? null);

	const dayKey = booking?.startTime
		? dateKeyInTimeZone(booking.startTime, timezone)
		: null;

	return (
		<Drawer
			direction="right"
			open={appointmentId !== null}
			onOpenChange={(next) => {
				if (!next) onClose();
			}}
		>
			<DrawerContent className="sm:max-w-md">
				<DrawerHeader className="border-b border-border">
					<DrawerDescription className="font-mono text-[10px] tracking-widest uppercase">
						Reserva
					</DrawerDescription>
					<DrawerTitle className="text-lg">Editar reserva</DrawerTitle>
				</DrawerHeader>

				{isLoading || !booking ? (
					<div className="flex flex-1 items-center justify-center">
						<Spinner />
					</div>
				) : (
					<div className="flex-1 space-y-5 overflow-y-auto p-4">
						{/* Fecha y hora */}
						<div className="flex items-start gap-3">
							<span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
								<Clock className="h-4 w-4 text-muted-foreground" />
							</span>
							<div className="min-w-0">
								<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
									Fecha y hora
								</p>
								<p className="text-sm font-medium">
									{dayKey ? describeDay(dayKey) : 'Sin fecha'} ·{' '}
									{timeIn(booking.startTime ?? '', timezone)}
								</p>
								<p className="text-xs text-muted-foreground">
									Termina {timeIn(booking.endTime ?? '', timezone)} ·{' '}
									{booking.totalDuration} min en total
								</p>
							</div>
						</div>

						{/* Cliente, en lectura: cambiar de quién es la cita no es editarla. */}
						<div className="flex items-start gap-3">
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

						{/* Servicios, uno por tramo, cada uno con su profesional y su hora. */}
						<div className="space-y-2">
							<p className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
								<Scissors className="h-3 w-3" />
								Servicios · {booking.segments?.length ?? 0}
							</p>

							<ul className="space-y-2">
								{(booking.segments ?? []).map((segment, index) => (
									<li
										key={`${segment.serviceId}-${index}`}
										className="flex items-center gap-3"
									>
										<span className="w-11 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
											{timeIn(segment.startTime, timezone)}
										</span>
										<div className="min-w-0 flex-1 rounded-lg border border-border bg-card p-3">
											<div className="flex items-baseline justify-between gap-2">
												<p className="truncate text-sm font-medium">
													{segment.serviceName ?? 'Servicio'}
												</p>
												<p className="shrink-0 text-sm tabular-nums">
													{segment.price}
												</p>
											</div>
											<p className="truncate text-xs text-muted-foreground">
												{segment.durationMinutes} min ·{' '}
												{segment.staffName ?? 'Sin profesional'}
											</p>
										</div>
									</li>
								))}
							</ul>
						</div>

						<div className="space-y-1 border-t border-border pt-4">
							<span
								className={cn(
									'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
									colors.surface,
								)}
							>
								{getAppointmentStatusText(status)}
							</span>
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
					</div>
				)}

				<DrawerFooter className="flex-row items-center justify-between border-t border-border">
					<div className="text-sm">
						<span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
							Total
						</span>
						<p className="text-base font-semibold tabular-nums">
							{booking?.totalPrice ?? 0}
						</p>
					</div>
					<Button variant="outline" onClick={onClose}>
						Cerrar
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
};

export default BookingDrawer;
