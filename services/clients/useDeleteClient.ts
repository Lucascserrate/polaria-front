import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteClient } from './clients.service';
import { clientKeys } from './clientKeys';

/**
 * Elimina un cliente y refresca la lista.
 *
 * Se invalida en vez de sacar la fila de la caché: el backend decide entre
 * borrado y baja lógica según el historial, y lo que devuelva el listado después
 * ya es la verdad. Adivinar cuál de los dos ocurrió sería duplicar esa regla acá.
 */
const useDeleteClient = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteClient(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: clientKeys.all });
		},
	});
};

export default useDeleteClient;
