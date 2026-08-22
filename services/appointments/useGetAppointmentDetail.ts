import { useQuery } from '@tanstack/react-query';
import { APPOINTMENTS_KEY } from '@/modules/staff/constants';
import { getAppointmentDetail } from './appointments.service';

/**
 * La reserva que se está viendo o editando.
 *
 * Cuelga de la raíz de citas para que editar una la invalide junto con la agenda,
 * y sin `id` queda deshabilitada: el drawer se monta antes de que haya algo que
 * pedir.
 */
const useGetAppointmentDetail = (id: string | null) => {
	return useQuery({
		queryKey: [...APPOINTMENTS_KEY, 'detail', id],
		queryFn: () => getAppointmentDetail(id as string),
		enabled: Boolean(id),
	});
};

export default useGetAppointmentDetail;
