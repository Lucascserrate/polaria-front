'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { Appointment } from '@/types/appointments.types';
import useNow from '@/lib/useNow';
import TimelineAppointmentCard from './TimelineAppointmentCard';
import {
	buildDayLayout,
	buildHourMarks,
	formatMinute,
	minutesInTimeZone,
	PX_PER_MINUTE,
	resolveDayRange,
} from './utils/dayTimeline';

/** Ancho de la columna de horas. La regla y las citas comparten esta medida. */
const RULER_WIDTH = 48;

/** Separación entre dos citas simultáneas, en porcentaje del ancho disponible. */
const LANE_GAP = 1.5;

interface Props {
	appointments: Appointment[];
	onMarkAttended: (id: string) => void;
	onCancel: (id: string) => void;
	updatingId?: string | null;
	/** Franjas de atención del día, para no dibujar horas en las que está cerrado. */
	businessRanges?: Array<{ startMinute: number; endMinute: number }>;
	/** Solo el día en curso tiene línea de "ahora" y se desplaza hasta ella. */
	isToday?: boolean;
	/** Zona del negocio, para ubicar la línea de "ahora" donde corresponde. */
	timezone?: string;
	emptyMessage?: string;
}

/**
 * Agenda del día: las horas en vertical y las citas ubicadas según su horario.
 *
 * Reemplaza a la lista cronológica que había antes. Una lista no podía mostrar
 * lo que más importa cuando el negocio tiene varios profesionales: que dos citas
 * a las 16:00 son simultáneas y no consecutivas. Acá las que se pisan se
 * reparten en carriles, y el alto de cada card es su duración, así que la
 * ocupación y los huecos del día se leen de un vistazo.
 */
const AppointmentTimeline = ({
	appointments,
	onMarkAttended,
	onCancel,
	updatingId,
	businessRanges,
	isToday = false,
	timezone,
	emptyMessage = 'No hay citas para este día',
}: Props) => {
	const scrollRef = useRef<HTMLDivElement>(null);
	const hasScrolledToNow = useRef(false);

	// El reloj solo corre en el día de hoy: en otra fecha no hay ninguna línea
	// que mover y el intervalo sería trabajo que nadie mira.
	const now = useNow(60_000, isToday);

	const range = useMemo(
		() => resolveDayRange(appointments, businessRanges),
		[appointments, businessRanges],
	);

	const layout = useMemo(
		() => buildDayLayout(appointments, range),
		[appointments, range],
	);

	const hourMarks = useMemo(() => buildHourMarks(range), [range]);

	const nowMinute = useMemo(
		// `now` en 0 significa que el reloj todavía no montó: no hay hora que dibujar.
		() =>
			isToday && now > 0
				? minutesInTimeZone(new Date(now).toISOString(), timezone)
				: null,
		[isToday, now, timezone],
	);

	const nowTop =
		nowMinute !== null &&
		nowMinute >= range.startMinute &&
		nowMinute <= range.endMinute
			? (nowMinute - range.startMinute) * PX_PER_MINUTE
			: null;

	const totalHeight = (range.endMinute - range.startMinute) * PX_PER_MINUTE;

	/**
	 * Al abrir el día de hoy, la vista arranca en la hora actual.
	 *
	 * Es el reemplazo del orden "por cercanía" que tenía la lista: en una agenda
	 * la posición la fija el reloj, así que lo que hacía falta no era reordenar
	 * sino mirar el lugar correcto. Se hace una sola vez para no arrastrar la
	 * vista mientras alguien está leyendo otra parte del día.
	 */
	useEffect(() => {
		if (!isToday || nowTop === null || hasScrolledToNow.current) return;

		const container = scrollRef.current;
		if (!container) return;

		hasScrolledToNow.current = true;
		container.scrollTo({
			top: Math.max(0, nowTop - container.clientHeight / 3),
			behavior: 'smooth',
		});
	}, [isToday, nowTop]);

	if (appointments.length === 0) {
		return (
			<div className="py-12 text-center">
				<p className="text-muted-foreground">{emptyMessage}</p>
			</div>
		);
	}

	return (
		<div ref={scrollRef} className="h-full overflow-y-auto pt-2">
			<div className="relative" style={{ height: totalHeight }}>
				{/* Regla de horas. */}
				{hourMarks.map((minute) => {
					const top = (minute - range.startMinute) * PX_PER_MINUTE;
					return (
						<div
							key={minute}
							className="absolute left-0 right-0 flex items-start"
							style={{ top }}
						>
							<span
								className="shrink-0 -translate-y-1.5 pr-2 text-right text-[11px] tabular-nums text-muted-foreground"
								style={{ width: RULER_WIDTH }}
							>
								{formatMinute(minute)}
							</span>
							<span className="mt-0 h-px flex-1 bg-border" aria-hidden="true" />
						</div>
					);
				})}

				{/* Citas. */}
				<div
					className="absolute inset-y-0 right-0"
					style={{ left: RULER_WIDTH }}
				>
					{layout.map((item) => {
						const width = 100 / item.laneCount;
						return (
							<div
								key={item.appointment.id}
								className="absolute"
								style={{
									top: item.top,
									height: item.height,
									left: `${item.lane * width}%`,
									width: `calc(${width}% - ${LANE_GAP}%)`,
								}}
							>
								<TimelineAppointmentCard
									appointment={item.appointment}
									startMinute={item.startMinute}
									endMinute={item.endMinute}
									height={item.height}
									onMarkAttended={onMarkAttended}
									onCancel={onCancel}
									isUpdating={updatingId === item.appointment.id}
								/>
							</div>
						);
					})}
				</div>

				{/* Línea de ahora, por encima de las citas para no quedar tapada. */}
				{nowTop !== null && (
					<div
						className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
						style={{ top: nowTop }}
						aria-hidden="true"
					>
						<span
							className="shrink-0 pr-2 text-right"
							style={{ width: RULER_WIDTH }}
						></span>
						<span className="h-px flex-1 bg-sky-500" />
					</div>
				)}
			</div>
		</div>
	);
};

export default AppointmentTimeline;
