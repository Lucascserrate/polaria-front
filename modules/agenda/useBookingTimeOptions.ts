'use client';

import { useMemo } from 'react';
import useGetSlotsForBooking, {
	type BookingSlotItem,
} from '@/services/availability/useGetSlotsForBooking';
import useGetAppointmentsRange from '@/services/appointments/useGetAppointmentsRange';
import useGetSettings from '@/services/settings/useGetSettings';
import {
	dateKeyInTimeZone,
	dayMinutesOf,
	instantAtMinute,
	minutesInTimeZone,
	openRangesForWeekday,
	weekdayOf,
	type MinuteRange,
} from './utils/calendarLayout';
import { buildHistoricalSlots } from './utils/panelSlots';

/** Una opción de horario, ya resuelta a instante. */
export interface TimeOption {
	startTime: string;
	minute: number;
	/** Por qué el horario es inusual, o `null` si no lo es. */
	notice: string | null;
}

interface Input {
	/** Día que se está mirando, `YYYY-MM-DD`. */
	date: string;
	/** Hoy en la zona del negocio. */
	todayKey: string;
	timezone?: string;
	/** Los tramos de la reserva, con su desplazamiento. */
	items: BookingSlotItem[];
	/** Duración total, para saber qué tramos entran en el pasado. */
	totalMinutes: number;
	/** Reserva que se edita: sus minutos no cuentan como ocupados. */
	excludeAppointmentId?: string;
}

/**
 * A qué hora puede empezar la reserva ese día.
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
 * En el pasado, los horarios ocupados o fuera de horario se devuelven
 * **marcados** en lugar de omitirse: el dueño necesita saber por qué un horario
 * es raro, no que desaparezca.
 *
 * Vive en un hook y no dentro de una pantalla porque hay dos que preguntan lo
 * mismo —el paso de horarios de la edición y el desplegable de la reserva
 * nueva— y son reglas de disponibilidad, no de maquetado: dos copias
 * divergirían justo en el caso raro, que es el que nadie prueba a mano.
 */
const useBookingTimeOptions = ({
	date,
	todayKey,
	timezone,
	items,
	totalMinutes,
	excludeAppointmentId,
}: Input) => {
	const isPast = date < todayKey;

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
				if (
					minute === null ||
					dateKeyInTimeZone(startTime, timezone) !== date
				) {
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

	return {
		options,
		isPast,
		isLoading: isPast ? loadingDay : loadingSlots,
		isError,
	};
};

export default useBookingTimeOptions;
