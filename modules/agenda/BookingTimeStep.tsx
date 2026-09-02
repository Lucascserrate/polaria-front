'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { BookingSlotItem } from '@/services/availability/useGetSlotsForBooking';
import { formatMinute, shiftDateKey } from './utils/calendarLayout';
import { dayNumber, weekdayLabel } from './utils/calendarLabels';
import useBookingTimeOptions from './useBookingTimeOptions';

/** Días que muestra la tira. Una semana entra sin scroll horizontal. */
const STRIP_DAYS = 7;

interface Props {
	/** Día que se está mirando, `YYYY-MM-DD`. */
	date: string;
	onDateChange: (date: string) => void;
	/** Hoy en la zona del negocio. */
	todayKey: string;
	timezone?: string;
	/** Los tramos de la reserva, con su desplazamiento. */
	items: BookingSlotItem[];
	/** Duración total de la reserva, para saber qué tramos entran. */
	totalMinutes: number;
	/** Reserva que se edita: sus minutos no cuentan como ocupados. */
	excludeAppointmentId?: string;
	/** Inicio elegido, en ISO. */
	selected: string | null;
	onSelect: (startTime: string) => void;
}

/**
 * Elegir cuándo, como paso propio del panel de edición.
 *
 * Una tira de días y una grilla de horarios, que es lo que entra cuando hay
 * pantalla entera para gastar. La reserva nueva no usa esto: ahí el día y la
 * hora se cambian en el lugar donde se leen, con dos desplegables.
 *
 * De dónde salen los horarios —el motor para lo que viene, la grilla histórica
 * para el pasado— lo resuelve `useBookingTimeOptions`, que es el mismo que
 * alimenta a la reserva nueva.
 */
const BookingTimeStep: React.FC<Props> = ({
	date,
	onDateChange,
	todayKey,
	timezone,
	items,
	totalMinutes,
	excludeAppointmentId,
	selected,
	onSelect,
}) => {
	// La tira arranca en el día abierto y se pagina de a semana.
	const [stripStart, setStripStart] = useState(date);

	const days = Array.from({ length: STRIP_DAYS }, (_, index) =>
		shiftDateKey(stripStart, index),
	);

	const { options, isPast, isLoading, isError } = useBookingTimeOptions({
		date,
		todayKey,
		timezone,
		items,
		totalMinutes,
		excludeAppointmentId,
	});

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="Semana anterior"
					onClick={() => setStripStart(shiftDateKey(stripStart, -STRIP_DAYS))}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				<div className="flex flex-1 gap-1">
					{days.map((day) => {
						const isSelected = day === date;
						const isBefore = day < todayKey;

						return (
							<button
								key={day}
								type="button"
								onClick={() => onDateChange(day)}
								className={cn(
									'flex-1 rounded-lg border py-1.5 text-center transition-colors',
									isSelected
										? 'border-foreground bg-muted'
										: 'border-border hover:bg-muted/60',
									// Los días pasados se pueden elegir —el panel registra
									// historia— pero se ven distintos: registrar no es agendar.
									isBefore && !isSelected && 'text-muted-foreground',
								)}
							>
								<span className="block text-sm font-semibold tabular-nums">
									{dayNumber(day)}
								</span>
								<span className="block font-mono text-[9px] tracking-wider text-muted-foreground uppercase">
									{weekdayLabel(day)}
								</span>
							</button>
						);
					})}
				</div>

				<Button
					variant="ghost"
					size="icon-sm"
					aria-label="Semana siguiente"
					onClick={() => setStripStart(shiftDateKey(stripStart, STRIP_DAYS))}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>

			<div className="flex items-baseline justify-between gap-2">
				<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
					{isPast ? 'Horarios del día' : 'Horarios disponibles'}
				</p>
				{isPast && (
					<p className="text-xs text-muted-foreground">
						Se registra como atendida
					</p>
				)}
			</div>

			{isLoading ? (
				<div className="flex justify-center py-8">
					<Spinner />
				</div>
			) : isError ? (
				<p className="text-sm text-red-600">
					No se pudieron cargar los horarios. Intentá de nuevo.
				</p>
			) : options.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					{items.length > 1
						? 'Ese día no hay ningún horario en el que entren todos los servicios de la reserva con sus profesionales.'
						: 'No quedan horarios disponibles ese día para ese servicio y ese profesional.'}
				</p>
			) : (
				<div className="grid grid-cols-3 gap-2">
					{options.map((option) => (
						<Button
							key={option.startTime}
							type="button"
							size="sm"
							variant={option.startTime === selected ? 'default' : 'outline'}
							className={cn(
								'h-auto flex-col gap-0 py-1.5 tabular-nums',
								option.notice && option.startTime !== selected && 'opacity-70',
							)}
							onClick={() => onSelect(option.startTime)}
						>
							{formatMinute(option.minute)}
							{option.notice && (
								<span className="text-[9px] font-normal opacity-80">
									{option.notice}
								</span>
							)}
						</Button>
					))}
				</div>
			)}
		</div>
	);
};

export default BookingTimeStep;
