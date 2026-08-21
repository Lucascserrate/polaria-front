import { useQuery } from '@tanstack/react-query';
import { getServices } from './services.service';
import { serviceKeys } from './serviceKeys';
import type { Service } from '@/types/services.types';

const useGetServices = () => {
	return useQuery<Service[]>({
		queryKey: serviceKeys.list(),
		queryFn: getServices,
	});
};

export default useGetServices;
