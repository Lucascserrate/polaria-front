import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStaff } from './staff.service';
import { staffKeys } from './staffKeys';
import type { UpdateStaffDto } from '@/types/staff.types';

const useUpdateStaff = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateStaffDto }) =>
			updateStaff(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: staffKeys.all });
		},
		onError: (error) => {
			console.error('Error updating staff member:', error);
		},
	});
};

export default useUpdateStaff;
