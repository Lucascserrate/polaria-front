import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APPOINTMENTS_KEY } from '@/modules/staff/constants';
import {
	createAppointment,
	type CreateBookingPayload,
} from './appointments.service';

/**
 * Crea una reserva desde el panel.
 *
 * Invalida por la raíz de citas —la nueva aparece en la agenda de su día— y
 * también la lista de clientes, porque crear una reserva puede haber creado al
 * cliente.
 */
const useCreateBooking = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload: CreateBookingPayload) => createAppointment(payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY });
			void queryClient.invalidateQueries({ queryKey: ['clients'] });
		},
	});
};

export default useCreateBooking;
