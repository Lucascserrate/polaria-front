import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAppointmentStatus } from './appointments.service';
import { AppointmentStatus } from '@/types/appointments.types';
import { APPOINTMENTS_KEY } from '@/modules/staff/constants';

const useUpdateAppointmentStatus = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, status }: { id: string; status: AppointmentStatus }) =>
			updateAppointmentStatus(id, status),
		onSuccess: () => {
			// Por la raíz y no por el día visible: la agenda de cada fecha es su
			// propia entrada en caché, y marcar una cita como atendida no puede
			// dejar desactualizadas a las demás.
			queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY });
		},
		onError: (error) => {
			console.error('Error updating appointment status:', error);
		},
	});
};
export default useUpdateAppointmentStatus;
