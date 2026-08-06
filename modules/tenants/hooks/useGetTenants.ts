import { useQuery } from '@tanstack/react-query';

import { getTenants } from '@/services/tenants';
import type { Tenant } from '@/types/tenant.types';

export const useGetTenants = () => {
	return useQuery<Tenant[]>({
		queryKey: ['tenants'],
		queryFn: getTenants,
	});
};
