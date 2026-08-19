import { useQuery } from '@tanstack/react-query';
import { getWorkingStaff } from './staff.service';
import { staffKeys } from './staffKeys';
import type { WorkingStaffResponse } from '@/types/staff.types';

const useGetWorkingStaff = (date?: string) => {
	return useQuery<WorkingStaffResponse>({
		queryKey: staffKeys.working(date),
		queryFn: () => getWorkingStaff(date),
	});
};

export default useGetWorkingStaff;
