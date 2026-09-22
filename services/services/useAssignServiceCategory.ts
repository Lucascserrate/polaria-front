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
 *
 * Toca **todas** las listas y no una: el catálogo vive en caché dos veces, con
 * los desactivados y sin ellos, y el arrastre pasa por la pantalla que los
 * muestra. Apuntando a una sola clave, la fila no se movía en la única lista
 * donde alguien la estaba arrastrando.
 */
const useAssignServiceCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, categoryId }: Input) =>
			updateService(id, { categoryId }),

		onMutate: async ({ id, categoryId }: Input) => {
			const lists = { queryKey: serviceKeys.lists() };

			// Una recarga en vuelo pisaría el cambio optimista con datos viejos.
			await queryClient.cancelQueries(lists);

			// Cada lista con su clave, para poder devolver cada una a lo que tenía.
			const previous = queryClient.getQueriesData<Service[]>(lists);

			queryClient.setQueriesData<Service[]>(lists, (current) =>
				current?.map((service) =>
					service.id === id ? { ...service, categoryId } : service,
				),
			);

			return { previous };
		},

		onError: (error, _input, context) => {
			for (const [key, services] of context?.previous ?? []) {
				queryClient.setQueryData(key, services);
			}
			console.error('Error assigning service category:', error);
		},

		onSettled: () => {
			void queryClient.invalidateQueries({ queryKey: serviceKeys.all });
		},
	});
};

export default useAssignServiceCategory;
