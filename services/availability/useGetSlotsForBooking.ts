import { useQueries } from '@tanstack/react-query';
import {
	intersectSlotStarts,
	type SlotItemAvailability,
} from '@/modules/agenda/utils/slotIntersection';
import { getBookingSlots } from './bookingSlots.service';

export interface BookingSlotItem {
	serviceId: string;
	staffId: string;
	/** Minutos desde el inicio de la reserva en que arranca este tramo. */
	offsetMinutes: number;
}

/**
 * A qué horas puede empezar una reserva completa en una fecha.
 *
 * Pregunta al motor una vez por tramo —es lo que el motor sabe responder: un
 * servicio, un profesional— y cruza las respuestas con los desplazamientos de
 * cada uno. Una reserva de un solo servicio es el caso degenerado: una consulta y
 * su propia lista.
 *
 * `excludeAppointmentId` es lo que hace posible editar: sin él, la reserva que se
 * está moviendo aparecería ocupando su propio horario.
 */
const useGetSlotsForBooking = (params: {
	date: string;
	items: BookingSlotItem[];
	excludeAppointmentId?: string;
	/** El panel no aplica la anticipación mínima del cliente. */
	scope?: 'client' | 'panel';
	enabled?: boolean;
}) => {
	const {
		date,
		items,
		excludeAppointmentId,
		scope = 'client',
		enabled = true,
	} = params;

	const queries = useQueries({
		queries: items.map((item) => ({
			queryKey: [
				'availability',
				'booking-slots',
				date,
				item.serviceId,
				item.staffId,
				excludeAppointmentId ?? null,
				scope,
			],
			queryFn: () =>
				getBookingSlots({
					date,
					serviceId: item.serviceId,
					staffId: item.staffId,
					excludeAppointmentId,
					scope,
				}),
			enabled: enabled && Boolean(date),
			staleTime: 30_000,
		})),
	});

	const isLoading = queries.some((query) => query.isLoading);
	const isError = queries.some((query) => query.isError);
	const ready = queries.every((query) => query.data !== undefined);

	const availability: SlotItemAvailability[] = ready
		? items.map((item, index) => ({
				offsetMinutes: item.offsetMinutes,
				startTimes: (queries[index].data ?? []).map((slot) => slot.startTime),
			}))
		: [];

	return {
		/** Inicios posibles de la reserva completa, en ISO y en orden. */
		startTimes: ready ? intersectSlotStarts(availability) : [],
		isLoading,
		isError,
	};
};

export default useGetSlotsForBooking;
