import { useMutation, useQueryClient } from '@tanstack/react-query';

import { tenantsService } from '@/services/tenants.service';

const useDeleteTenant = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => tenantsService.delete(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['tenants'] });
		},
	});
};

export default useDeleteTenant;
