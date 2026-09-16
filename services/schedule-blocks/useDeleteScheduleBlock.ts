import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	deleteScheduleBlock,
	scheduleBlockKeys,
} from './schedule-blocks.service';

/** Ver `useCreateScheduleBlock` para por qué se invalida y no se escribe la caché. */
const useDeleteScheduleBlock = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteScheduleBlock,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: scheduleBlockKeys.all });
		},
	});
};

export default useDeleteScheduleBlock;
