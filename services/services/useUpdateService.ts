import { ServiceApi } from '@/types/appointments.types';
import { updateService } from './services';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const useUpdateService = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async ({
			id,
			body,
		}: {
			id: string;
			body: Partial<ServiceApi>;
		}) => {
			return await updateService(id, body);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ['services'] });
		},
	});
};

export default useUpdateService;
