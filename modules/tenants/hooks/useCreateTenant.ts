import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tenantsService } from '@/services/tenants.service';
import type { CreateTenantDto } from '@/types/tenant.types';

const useCreateTenant = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (body: CreateTenantDto) => tenantsService.create(body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tenants'] });
		},
	});
};

export default useCreateTenant;
