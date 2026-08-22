import { useQuery } from '@tanstack/react-query';
import { getWorkingStaff } from './staff.service';
import { staffKeys } from './staffKeys';
import type { WorkingStaffResponse } from '@/types/staff.types';

/**
 * Quién trabaja ese día, con su jornada.
 *
 * @param enabled La agenda solo lo necesita en la vista diaria; en la semanal
 * sería un pedido por cada navegación que nadie mira.
 */
const useGetWorkingStaff = (date?: string, enabled = true) => {
	return useQuery<WorkingStaffResponse>({
		queryKey: staffKeys.working(date),
		queryFn: () => getWorkingStaff(date),
		enabled,
	});
};

export default useGetWorkingStaff;
