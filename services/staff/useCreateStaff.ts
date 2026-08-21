import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStaff } from './staff.service';
import { staffKeys } from './staffKeys';
import type { CreateStaffDto } from '@/types/staff.types';

const useCreateStaff = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateStaffDto) => createStaff(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: staffKeys.all });
		},
		onError: (error) => {
			console.error('Error creating staff member:', error);
		},
	});
};

export default useCreateStaff;
