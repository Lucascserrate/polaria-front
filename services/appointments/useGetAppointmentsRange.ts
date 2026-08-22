import { useQuery } from '@tanstack/react-query';
import {
	AGENDA_REFETCH_MS,
	rangeAppointmentsKey,
} from '@/modules/staff/constants';
import { mapAppointment } from '@/modules/appointments/utils/mapAppointment';
import type { AppointmentApiRange } from '@/types/appointments.types';
import { getAppointmentsRange } from './appointments.service';

/**
 * Se define fuera del hook a propósito: React Query memoiza `select` por
 * identidad de la función, y una lambda inline recalcularía el mapeo en cada
 * render.
 */
const toCalendar = (data: AppointmentApiRange) => ({
	...data,
	items: data.items.map(mapAppointment),
});

/**
 * Las citas de un rango de días.
 *
 * @param from `YYYY-MM-DD` en la zona del negocio.
 * @param to Igual, inclusive.
 */
const useGetAppointmentsRange = (from: string, to: string) => {
	return useQuery({
		queryKey: rangeAppointmentsKey(from, to),
		queryFn: () => getAppointmentsRange(from, to),
		refetchInterval: AGENDA_REFETCH_MS,
		select: toCalendar,
		/**
		 * Al navegar a otra semana se sigue mostrando la anterior mientras llega
		 * la nueva. Sin esto la grilla parpadea vacía en cada flecha, que se lee
		 * como "esa semana no tiene citas".
		 */
		placeholderData: (previous) => previous,
	});
};

export default useGetAppointmentsRange;
