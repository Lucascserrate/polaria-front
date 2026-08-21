import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateService } from './services.service';
import { serviceKeys } from './serviceKeys';
import type { UpdateServiceInput } from '@/types/services.types';

const useUpdateService = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: UpdateServiceInput) => updateService(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: serviceKeys.all });
		},
		onError: (error) => {
			console.error('Error updating service:', error);
		},
	});
};

export default useUpdateService;
