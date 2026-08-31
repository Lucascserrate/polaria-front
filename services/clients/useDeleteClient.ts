import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteClient } from './clients.service';
import { clientKeys } from './clientKeys';

/**
 * Elimina un cliente y refresca la lista.
 *
 * Se invalidan **sólo las listas**, no la ficha del que se acaba de eliminar.
 *
 * No es un detalle de eficiencia. Al borrar, la pantalla de edición todavía está
 * montada mientras se navega, así que sigue observando la ficha de ese cliente:
 * tanto invalidarla como sacarla de la caché disparan una consulta nueva sobre
 * un cliente que ya no existe, y eso son dos 404 y un parpadeo de "no
 * encontramos a este cliente" justo antes de la redirección.
 *
 * Que la lista se invalide y no se edite a mano es a propósito: el backend
 * decide entre borrado y baja lógica según el historial, y lo que devuelva
 * después ya es la verdad. Adivinar cuál de los dos ocurrió sería duplicar esa
 * regla acá.
 */
const useDeleteClient = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteClient(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
		},
	});
};

export default useDeleteClient;
