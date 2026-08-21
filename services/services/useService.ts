import { useQuery } from '@tanstack/react-query';
import { getService } from './services.service';
import { serviceKeys } from './serviceKeys';

const useService = (id: string) => {
	return useQuery({
		queryKey: serviceKeys.detail(id),
		queryFn: () => getService(id),
		enabled: Boolean(id),
	});
};

export default useService;
