'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import useGetSlotsForBooking, {
	type BookingSlotItem,
} from '@/services/availability/useGetSlotsForBooking';
import useGetAppointmentsRange from '@/services/appointments/useGetAppointmentsRange';
import useGetSettings from '@/services/settings/useGetSettings';
import {
	dateKeyInTimeZone,
	dayMinutesOf,
	formatMinute,
	instantAtMinute,
	minutesInTimeZone,
	openRangesForWeekday,
	shiftDateKey,
	weekdayOf,
	type MinuteRange,
} from './utils/calendarLayout';
import { buildHistoricalSlots } from './utils/panelSlots';
import { dayNumber, weekdayLabel } from './utils/calendarLabels';

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
	/** Reserva que se edita: sus minutos no cuentan como ocupados. Ausente al crear. */
	excludeAppointmentId?: string;
	/** Inicio elegido, en ISO. */
	selected: string | null;
	onSelect: (startTime: string) => void;
}

/** Una opción de horario, ya resuelta a instante. */
interface TimeOption {
	startTime: string;
	minute: number;
	/** Por qué el horario es inusual, o `null` si no lo es. */
	notice: string | null;
}

/**
 * Elegir cuándo.
 *
 * Tiene dos fuentes, y la diferencia no es un detalle de implementación:
 *
 * - **Hoy y de acá en adelante**, los horarios salen del motor de disponibilidad
 *   —el mismo que usa WhatsApp— con la salvedad de que el panel no aplica la
 *   anticipación mínima. Lo que se ofrece es lo que se puede reservar.
 * - **Fechas pasadas** se ofrecen completas, en tramos de 15 minutos. Ahí no se
 *   está reservando: se está registrando lo que pasó, y el motor —que solo genera
 *   candidatos dentro de la jornada y hacia adelante— no tiene nada que decir.
 *
 * En el pasado, los horarios ocupados o fuera de horario se ofrecen **marcados**
 * en lugar de esconderse: el dueño necesita saber por qué un horario es raro, no
 * que desaparezca.
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

	const isPast = date < todayKey;

	const days = Array.from({ length: STRIP_DAYS }, (_, index) =>
		shiftDateKey(stripStart, index),
	);

	const { data: settings } = useGetSettings();

	const {
		startTimes,
		isLoading: loadingSlots,
		isError,
	} = useGetSlotsForBooking({
		date,
		items,
		excludeAppointmentId,
		scope: 'panel',
		enabled: !isPast && items.length > 0,
	});

	/*
	 * En el pasado hace falta saber qué había agendado ese día para poder marcar
	 * los horarios ocupados. Es la misma consulta que dibuja la agenda, así que
	 * suele venir de la caché.
	 */
	const { data: dayBookings, isLoading: loadingDay } = useGetAppointmentsRange(
		date,
		date,
	);

	const options = useMemo<TimeOption[]>(() => {
		if (!isPast) {
			return startTimes.flatMap((startTime) => {
				const minute = minutesInTimeZone(startTime, timezone);

				// El motor devuelve instantes: si alguno cayera en otro día, se omite
				// en lugar de mostrarlo bajo la fecha equivocada.
				if (minute === null || dateKeyInTimeZone(startTime, timezone) !== date) {
					return [];
				}

				return [{ startTime, minute, notice: null }];
			});
		}

		const busyRanges: MinuteRange[] = (dayBookings?.items ?? []).flatMap(
			(appointment) =>
				appointment.segments
					.filter((segment) =>
						items.some((item) => item.staffId === segment.staffId),
					)
					.flatMap((segment) => {
						const range = dayMinutesOf({
							startTime: segment.startTime,
							endTime: segment.endTime,
							timezone,
						});
						return range ? [range] : [];
					}),
		);

		return buildHistoricalSlots({
			durationMinutes: totalMinutes,
			busyRanges,
			openRanges: openRangesForWeekday(
				settings?.businessHours,
				weekdayOf(date),
			),
		}).map((slot) => ({
			startTime: instantAtMinute(date, slot.minute, timezone),
			minute: slot.minute,
			notice: slot.busy
				? 'ocupado'
				: slot.outsideHours
					? 'fuera de horario'
					: null,
		}));
	}, [
		isPast,
		startTimes,
		timezone,
		date,
		dayBookings?.items,
		items,
		totalMinutes,
		settings?.businessHours,
	]);

	const isLoading = isPast ? loadingDay : loadingSlots;

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
