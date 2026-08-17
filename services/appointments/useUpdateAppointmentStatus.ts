import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAppointmentStatus } from './appointments.service';
import { AppointmentStatus } from '@/types/appointments.types';
import { TODAY_APPOINTMENTS_KEY } from '@/modules/staff/constants';

const useUpdateAppointmentStatus = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
			updateAppointmentStatus(id, status),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: TODAY_APPOINTMENTS_KEY });
		},
		onError: (error) => {
			console.error('Error updating appointment status:', error);
		},
	});
};
export default useUpdateAppointmentStatus;
