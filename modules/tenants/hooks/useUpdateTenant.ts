import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tenantsService } from '@/services/tenants.service';
import type { UpdateTenantDto } from '@/types/tenant.types';

type UpdateTenantParams = {
	id: string;
	body: UpdateTenantDto;
};

const useUpdateTenant = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, body }: UpdateTenantParams) =>
			tenantsService.update(id, body),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tenants'] });
		},
	});
};

export default useUpdateTenant;
