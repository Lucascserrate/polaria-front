import { useQuery } from '@tanstack/react-query';
import { getClientSummary } from './clients.service';
import { clientKeys } from './clientKeys';

const useGetClientSummary = (id?: string | null) => {
	return useQuery({
		queryKey: clientKeys.summary(id ?? ''),
		queryFn: () => getClientSummary(id as string),
		enabled: !!id,
	});
};

export default useGetClientSummary;
