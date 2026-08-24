import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APPOINTMENTS_KEY } from '@/modules/staff/constants';
import { deleteAppointment } from './appointments.service';

/**
 * Elimina una reserva del panel.
 *
 * Invalida por la raíz de citas: la reserva desaparece de la agenda de su día y
 * de cualquier rango que la estuviera mostrando.
 */
const useDeleteBooking = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteAppointment(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY });
		},
	});
};

export default useDeleteBooking;
