import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setParallelCategories } from './schedulingRules.service';
import { serviceCategoryKeys } from './serviceCategoryKeys';

const useSetParallelCategories = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			categoryId,
			categoryIds,
		}: {
			categoryId: string;
			categoryIds: string[];
		}) => setParallelCategories(categoryId, categoryIds),
		/*
		 * Se invalida todo el espacio de categorías y no sólo el de la que se
		 * editó: la regla es simétrica, así que guardar acá cambió también lo que
		 * responde la consulta de la otra categoría.
		 */
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: serviceCategoryKeys.all });
		},
	});
};

export default useSetParallelCategories;
