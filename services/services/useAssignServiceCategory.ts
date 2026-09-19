import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateService } from './services.service';
import { serviceKeys } from './serviceKeys';
import type { Service } from '@/types/services.types';

type Input = {
	id: string;
	/** `null` lo saca de la categoría que tenía. */
	categoryId: string | null;
};

/**
 * Cambia de categoría un servicio, sin esperar al servidor para moverlo.
 *
 * Es optimista porque el gesto ya dijo qué tiene que pasar: al soltar, el
 * servicio tiene que aparecer en la categoría donde lo soltaste. Esperar la
 * respuesta para recién ahí moverlo deja la fila quieta medio segundo, y quien
 * arrastra vuelve a intentarlo creyendo que no agarró.
 *
 * Si el servidor rechaza, se restaura la lista tal como estaba. `onSettled`
 * revalida en los dos casos: la copia optimista es una apuesta, no la verdad.
 */
const useAssignServiceCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, categoryId }: Input) =>
			updateService(id, { categoryId }),

		onMutate: async ({ id, categoryId }: Input) => {
			// Una recarga en vuelo pisaría el cambio optimista con datos viejos.
			await queryClient.cancelQueries({ queryKey: serviceKeys.list() });

			const previous = queryClient.getQueryData<Service[]>(serviceKeys.list());

			queryClient.setQueryData<Service[]>(serviceKeys.list(), (current) =>
				current?.map((service) =>
					service.id === id ? { ...service, categoryId } : service,
				),
			);

			return { previous };
		},

		onError: (error, _input, context) => {
			if (context?.previous) {
				queryClient.setQueryData(serviceKeys.list(), context.previous);
			}
			console.error('Error assigning service category:', error);
		},

		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: serviceKeys.all });
		},
	});
};

export default useAssignServiceCategory;
