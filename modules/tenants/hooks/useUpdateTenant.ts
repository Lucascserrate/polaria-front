import { useMutation, useQueryClient } from '@tanstack/react-query';

import { updateTenant } from '@/services/tenants';
import type { Tenant, UpdateTenantDto } from '@/types/tenant.types';

type UpdateTenantParams = {
	id: string;
	body: UpdateTenantDto;
};

export const useUpdateTenant = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, body }: UpdateTenantParams) => updateTenant({ id, body }),
		onSuccess: (updatedTenant: Tenant) => {
			queryClient.setQueryData<Tenant[]>(['tenants'], (current = []) =>
				current.map((tenant) =>
					tenant.id === updatedTenant.id ? updatedTenant : tenant,
				),
			);
		},
	});
};
