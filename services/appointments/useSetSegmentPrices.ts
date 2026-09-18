import { useMutation, useQueryClient } from '@tanstack/react-query';
import { APPOINTMENTS_KEY } from '@/modules/staff/constants';
import { setSegmentPrices } from './appointments.service';

/**
 * Escribe lo que se cobra en una cita.
 *
 * Invalida por la raíz de citas, como el resto: el importe se ve en la agenda del
 * día, en el detalle de la cita, en la ficha del cliente y en la cola de citas sin
 * resolver, y las cuatro tienen que decir lo mismo.
 */
const useSetSegmentPrices = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: {
			id: string;
			prices: Array<{ serviceId: string; price: number | null }>;
		}) => setSegmentPrices(input.id, input.prices),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: APPOINTMENTS_KEY });
		},
	});
};

export default useSetSegmentPrices;
