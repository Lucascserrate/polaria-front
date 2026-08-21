import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createService } from './services.service';
import { serviceKeys } from './serviceKeys';
import type { CreateServiceDto } from '@/types/services.types';

const useCreateService = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateServiceDto) => createService(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: serviceKeys.all });
		},
		onError: (error) => {
			console.error('Error creating service:', error);
		},
	});
};

export default useCreateService;
