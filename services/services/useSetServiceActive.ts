import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateService } from './services.service';
import { serviceKeys } from './serviceKeys';

/**
 * Da de baja un servicio, o lo vuelve a activar.
 *
 * Es una sola mutación para las dos direcciones porque es un solo cambio:
 * `isActive`. Antes la baja era `useDeleteService`, que llamaba a un `DELETE`
 * que no borraba nada —marcaba la fila como inactiva—, y la vuelta no existía.
 *
 * La fila nunca se borra: `appointment_services` la referencia, y sin ella las
 * citas viejas perderían el precio y la duración con los que se cobraron. Por eso
 * la baja es reversible y se cuenta así en la UI.
 *
 * Invalida por la raíz y no por una lista: el catálogo con los desactivados y el
 * de sólo activos son dos entradas en caché, y desactivar cambia las dos.
 */
const useSetServiceActive = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
			updateService(id, { isActive }),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: serviceKeys.all });
		},
		onError: (error) => {
			console.error('Error updating service availability:', error);
		},
	});
};

export default useSetServiceActive;
