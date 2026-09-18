import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteServiceCategory } from './serviceCategories.service';
import { serviceCategoryKeys } from './serviceCategoryKeys';
import { serviceKeys } from '../services/serviceKeys';

/**
 * Borra la categoría y refresca también el catálogo.
 *
 * Las dos invalidaciones son necesarias: los servicios que estaban en esa
 * categoría siguen existiendo pero ahora tienen `categoryId: null`, y sin
 * refrescarlos la lista los deja agrupados bajo un encabezado que ya no existe.
 */
const useDeleteServiceCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteServiceCategory(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: serviceCategoryKeys.all });
			void queryClient.invalidateQueries({ queryKey: serviceKeys.all });
		},
		onError: (error) => {
			console.error('Error deleting service category:', error);
		},
	});
};

export default useDeleteServiceCategory;
