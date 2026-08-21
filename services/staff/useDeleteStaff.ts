import { useMutation, useQueryClient } from '@tanstack/react-query';
import { STAFF_KEY } from '@/modules/staff/constants';
import { deleteStaff } from './staff.service';

/**
 * Elimina un profesional y refresca el equipo.
 *
 * Se invalida en lugar de sacar la fila de la caché a mano: el backend excluye a
 * los dados de baja del listado, así que la lista que devuelve ya es la verdad y
 * no hace falta adivinar cuál de los dos modos ocurrió para reflejarlo.
 */
const useDeleteStaff = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteStaff,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: STAFF_KEY });
		},
	});
};

export default useDeleteStaff;
