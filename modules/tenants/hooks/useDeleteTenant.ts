import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteTenant } from '@/services/tenants';
import type { Tenant } from '@/types/tenant.types';

export const useDeleteTenant = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteTenant(id),
		onSuccess: (deletedId: string) => {
			queryClient.setQueryData<Tenant[]>(['tenants'], (current = []) =>
				current.filter((tenant) => tenant.id !== deletedId),
			);
		},
	});
};
