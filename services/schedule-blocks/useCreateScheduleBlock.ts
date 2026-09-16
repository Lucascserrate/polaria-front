import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	createScheduleBlock,
	scheduleBlockKeys,
} from './schedule-blocks.service';

/**
 * Marca una franja como no disponible.
 *
 * Invalida en lugar de escribir la caché —al revés que las fotos— porque la
 * respuesta es el bloqueo recién creado y no el rango completo: con qué clave
 * quedaría escrito depende de qué semana se esté mirando, y eso lo sabe la
 * consulta, no la mutación.
 */
const useCreateScheduleBlock = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createScheduleBlock,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: scheduleBlockKeys.all });
		},
	});
};

export default useCreateScheduleBlock;
