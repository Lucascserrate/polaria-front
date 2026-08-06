import { useMutation, useQueryClient } from '@tanstack/react-query';

import { createTenant } from '@/services/tenants';
import type { CreateTenantDto, Tenant } from '@/types/tenant.types';

export const useCreateTenant = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (tenantData: CreateTenantDto) => createTenant(tenantData),
		onSuccess: (createdTenant: Tenant) => {
			queryClient.setQueryData<Tenant[]>(['tenants'], (current = []) => [
				createdTenant,
				...current,
			]);
		},
	});
};
