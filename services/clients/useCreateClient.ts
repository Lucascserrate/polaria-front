import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from './clients.service';
import { clientKeys } from './clientKeys';

const useCreateClient = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createClient,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: clientKeys.all });
		},
	});
};

export default useCreateClient;
