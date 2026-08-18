import { AGENDA_REFETCH_MS, dayAppointmentsKey } from '@/modules/staff/constants';
import { useQuery } from '@tanstack/react-query';
import { mapAppointment } from '@/modules/appointments/utils/mapAppointment';
import type { AppointmentApiToday } from '@/types/appointments.types';
import { getDayAppointments } from './appointments.service';

/**
 * Se define fuera del hook a propósito.
 *
 * React Query memoiza el resultado de `select` por identidad de la función: con
 * una lambda inline se recrearía en cada render y el mapeo se recalcularía
 * siempre.
 */
const toTimeline = (data: AppointmentApiToday) => ({
	...data,
	items: data.items.map(mapAppointment),
});

/** @param date `YYYY-MM-DD` en la zona horaria del negocio. */
const useGetDayAppointments = (date: string) => {
	return useQuery({
		queryKey: dayAppointmentsKey(date),
		queryFn: () => getDayAppointments(date),
		refetchInterval: AGENDA_REFETCH_MS,
		select: toTimeline,
		/**
		 * Al cambiar de día se sigue mostrando la agenda anterior mientras llega
		 * la nueva. Sin esto la lista parpadea a vacío en cada clic del
		 * calendario, que se lee como "ese día no tiene citas".
		 */
		placeholderData: (previous) => previous,
	});
};

export default useGetDayAppointments;
