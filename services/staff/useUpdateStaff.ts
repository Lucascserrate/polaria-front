import { useMutation, useQueryClient } from '@tanstack/react-query';
import { STAFF_KEY } from '@/modules/staff/constants';
import type { UpdateStaffDto } from '@/types/staff.types';
import { updateStaff } from './staff.service';

const useUpdateStaff = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateStaffDto }) =>
			updateStaff(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: STAFF_KEY });
		},
		onError: (error) => {
			console.error('Error updating staff:', error);
		},
	});
};

export default useUpdateStaff;
