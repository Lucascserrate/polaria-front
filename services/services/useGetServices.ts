import { useQuery } from '@tanstack/react-query';
import { getServices } from './services';
import { ServiceApi } from '@/types/appointments.types';

const useGetServices = () => {
	return useQuery<ServiceApi[]>({
		queryKey: ['services'],
		queryFn: getServices,
	});
};

export default useGetServices;
