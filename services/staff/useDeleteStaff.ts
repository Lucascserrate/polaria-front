import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteStaff } from './staff.service';
import { staffKeys } from './staffKeys';

const useDeleteStaff = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteStaff(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: staffKeys.all });
		},
		onError: (error) => {
			console.error('Error deleting staff member:', error);
		},
	});
};

export default useDeleteStaff;
