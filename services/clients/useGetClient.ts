import { useQuery } from '@tanstack/react-query';
import { getClient } from './clients.service';
import { clientKeys } from './clientKeys';

const useGetClient = (id?: string | null) => {
	return useQuery({
		queryKey: clientKeys.detail(id ?? ''),
		queryFn: () => getClient(id as string),
		enabled: !!id,
	});
};

export default useGetClient;
