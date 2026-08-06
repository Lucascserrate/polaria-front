import { useQuery } from '@tanstack/react-query';
import { getServices } from './services';
import { ServiceApi } from '@/types/appointments.types';

const useGetServices = () => {
	return useQuery<ServiceApi[]>({
		queryKey: ['services'],
		queryFn: async () => {
			const services = await getServices();
			return services.filter(
				(service) => service.isActive && !service.deletedAt,
			);
		},
	});
};

export default useGetServices;
