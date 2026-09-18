import { useMutation, useQueryClient } from '@tanstack/react-query';
import { moveServiceCategory } from './serviceCategories.service';
import { serviceCategoryKeys } from './serviceCategoryKeys';
import type {
	MoveServiceCategoryInput,
	ServiceCategory,
} from '@/types/service-categories.types';

/**
 * Sube o baja una categoría un lugar.
 *
 * Escribe la respuesta en la caché en lugar de invalidar: el servidor ya
 * devuelve la lista entera reordenada, y una invalidación agregaría un viaje de
 * ida y vuelta entre el toque y el cambio a la vista. En una pantalla donde se
 * tocan varias flechas seguidas, ese parpadeo se nota.
 */
const useMoveServiceCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, direction }: MoveServiceCategoryInput) =>
			moveServiceCategory(id, direction),
		onSuccess: (categories: ServiceCategory[]) => {
			queryClient.setQueryData(serviceCategoryKeys.list(), categories);
		},
		onError: (error) => {
			console.error('Error moving service category:', error);
		},
	});
};

export default useMoveServiceCategory;
