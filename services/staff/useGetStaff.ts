import { useQuery } from '@tanstack/react-query';
import { getStaff } from './staff.service';
import { staffKeys } from './staffKeys';
import type { StaffMember } from '@/types/staff.types';

const useGetStaff = () => {
	return useQuery<StaffMember[]>({
		queryKey: staffKeys.list(),
		queryFn: getStaff,
	});
};

export default useGetStaff;
