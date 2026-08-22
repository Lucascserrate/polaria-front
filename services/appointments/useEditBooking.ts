import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APPOINTMENTS_KEY } from '@/modules/staff/constants';
import { editBooking, type EditBookingPayload } from './appointments.service';

/**
 * Guarda los cambios de una reserva existente.
 *
 * Invalida por la raíz de citas: la reserva editada aparece en la agenda de su
 * día, en la del día al que se movió y en su propio detalle, y las tres tienen
 * que contar lo mismo.
 */
const useEditBooking = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: { id: string; payload: EditBookingPayload }) =>
			editBooking(input.id, input.payload),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY });
		},
	});
};

export default useEditBooking;
