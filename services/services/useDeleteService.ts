import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteService } from './services.service';
import { serviceKeys } from './serviceKeys';

const useDeleteService = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteService(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: serviceKeys.all });
		},
		onError: (error) => {
			console.error('Error deleting service:', error);
		},
	});
};

export default useDeleteService;
