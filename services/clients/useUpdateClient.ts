import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateClient, type ClientPayload } from './clients.service';
import { clientKeys } from './clientKeys';

const useUpdateClient = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: ClientPayload }) =>
			updateClient(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: clientKeys.all });
		},
	});
};

export default useUpdateClient;
