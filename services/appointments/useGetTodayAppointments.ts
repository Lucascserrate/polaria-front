import {
	AGENDA_REFETCH_MS,
	TODAY_APPOINTMENTS_KEY,
} from '@/modules/staff/constants';
import { useQuery } from '@tanstack/react-query';
import { mapAppointment } from '@/modules/appointments/utils/mapAppointment';
import type { AppointmentApiToday } from '@/types/appointments.types';
import { getTodayAppointments } from './appointments.service';

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

const useGetTodayAppointments = () => {
	return useQuery({
		queryKey: TODAY_APPOINTMENTS_KEY,
		queryFn: () => getTodayAppointments(),
		refetchInterval: AGENDA_REFETCH_MS,
		select: toTimeline,
	});
};

export default useGetTodayAppointments;
