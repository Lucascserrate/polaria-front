'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import useGetSlotsForBooking, {
	type BookingSlotItem,
} from '@/services/availability/useGetSlotsForBooking';
import {
	dateKeyInTimeZone,
	formatMinute,
	minutesInTimeZone,
	shiftDateKey,
} from './utils/calendarLayout';
import { dayNumber, weekdayLabel } from './utils/calendarLabels';

/** Días que muestra la tira. Una semana entra sin scroll horizontal. */
const STRIP_DAYS = 7;

interface Props {
	/** Día que se está mirando, `YYYY-MM-DD`. */
	date: string;
	onDateChange: (date: string) => void;
	/** Hoy en la zona del negocio: no se ofrecen días pasados. */
	todayKey: string;
	timezone?: string;
	/** Los tramos de la reserva, con su desplazamiento. */
	items: BookingSlotItem[];
	/** Reserva que se edita: sus minutos no cuentan como ocupados. */
	excludeAppointmentId: string;
	/** Inicio elegido, en ISO. */
	selected: string | null;
	onSelect: (startTime: string) => void;
}

/**
 * Elegir cuándo.
 *
 * Los horarios salen del mismo motor que usa WhatsApp, así que lo que se ofrece
 * acá es exactamente lo que se puede guardar. Para una reserva de varios
 * servicios se cruzan las disponibilidades de cada tramo: se ofrece la hora sólo
 * si **toda** la reserva entra, y no sólo su primer servicio.
 */
const BookingTimeStep: React.FC<Props> = ({
	date,
	onDateChange,
	todayKey,
	timezone,
	items,
	excludeAppointmentId,
	selected,
	onSelect,
}) => {
	// La tira arranca en el día abierto y se pagina de a semana.
	const [stripStart, setStripStart] = useState(date);

	const days = Array.from({ length: STRIP_DAYS }, (_, index) =>
		shiftDateKey(stripStart, index),
	);

	const { startTimes, isLoading, isError } = useGetSlotsForBooking({
		date,
		items,
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
						const isPast = day < todayKey;
						const isSelected = day === date;

						return (
							<button
								key={day}
								type="button"
								disabled={isPast}
								onClick={() => onDateChange(day)}
								className={cn(
									'flex-1 rounded-lg border py-1.5 text-center transition-colors',
									isSelected
										? 'border-foreground bg-muted'
										: 'border-border hover:bg-muted/60',
									// Un día pasado no se ofrece: no hay disponibilidad hacia atrás.
									isPast && 'cursor-not-allowed opacity-40 hover:bg-transparent',
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

			<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
				Horarios disponibles
			</p>

			{isLoading ? (
				<div className="flex justify-center py-8">
					<Spinner />
				</div>
			) : isError ? (
				<p className="text-sm text-red-600">
					No se pudieron cargar los horarios. Intentá de nuevo.
				</p>
			) : startTimes.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					{items.length > 1
						? 'Ese día no hay ningún horario en el que entren todos los servicios de la reserva con sus profesionales.'
						: 'No quedan horarios disponibles ese día para ese servicio y ese profesional.'}
				</p>
			) : (
				<div className="grid grid-cols-3 gap-2">
					{startTimes.map((startTime) => {
						const minute = minutesInTimeZone(startTime, timezone);
						const isSameDay =
							dateKeyInTimeZone(startTime, timezone) === date;

						// El motor devuelve instantes: si alguno cayera en otro día, se
						// omite en lugar de mostrarlo bajo la fecha equivocada.
						if (minute === null || !isSameDay) return null;

						return (
							<Button
								key={startTime}
								type="button"
								size="sm"
								variant={startTime === selected ? 'default' : 'outline'}
								className="tabular-nums"
								onClick={() => onSelect(startTime)}
							>
								{formatMinute(minute)}
							</Button>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default BookingTimeStep;
