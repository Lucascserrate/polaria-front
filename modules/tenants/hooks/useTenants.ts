import { useQuery } from '@tanstack/react-query';

import { tenantsService } from '@/services/tenants.service';

const useTenants = () => {
	return useQuery({
		queryKey: ['tenants'],
		queryFn: () => tenantsService.getAll(),
	});
};

export default useTenants;
