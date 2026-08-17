import { useQuery } from '@tanstack/react-query';
import { getWorkingStaff } from './staff.service';

const useGetWorkingStaff = () => {
	return useQuery({
		queryKey: ['staff', 'working'],
		queryFn: () => getWorkingStaff(),
	});
};

export default useGetWorkingStaff;
