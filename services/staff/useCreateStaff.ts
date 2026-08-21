import { useMutation, useQueryClient } from '@tanstack/react-query';
import { STAFF_KEY } from '@/modules/staff/constants';
import { createStaff } from './staff.service';

const useCreateStaff = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createStaff,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: STAFF_KEY });
		},
		onError: (error) => {
			console.error('Error creating staff:', error);
		},
	});
};

export default useCreateStaff;
