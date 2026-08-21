import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteStaff } from './staff.service';
import { staffKeys } from './staffKeys';

/**
 * Elimina un profesional y refresca el equipo.
 *
 * Se invalida en lugar de sacar la fila de la caché a mano: el backend excluye a
 * los dados de baja del listado, así que lo que devuelve ya es la verdad y no
 * hace falta adivinar cuál de los dos modos ocurrió para reflejarlo.
 */
const useDeleteStaff = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteStaff(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: staffKeys.all });
		},
		onError: (error) => {
			console.error('Error deleting staff member:', error);
		},
	});
};

export default useDeleteStaff;
