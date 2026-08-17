import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APPOINTMENTS_KEY } from '@/modules/staff/constants';
import { createAppointment } from './appointments.service';

export type CreateAppointmentInput = Parameters<typeof createAppointment>[0];

const useCreateAppointment = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateAppointmentInput) => createAppointment(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY });
		},
		onError: (error) => {
			console.error('Error creating appointment:', error);
		},
	});
};

export default useCreateAppointment;
