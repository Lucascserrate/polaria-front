import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateServiceCategory } from './serviceCategories.service';
import { serviceCategoryKeys } from './serviceCategoryKeys';
import type { UpdateServiceCategoryInput } from '@/types/service-categories.types';

const useUpdateServiceCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: UpdateServiceCategoryInput) =>
			updateServiceCategory(id, data),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: serviceCategoryKeys.all });
		},
		onError: (error) => {
			console.error('Error updating service category:', error);
		},
	});
};

export default useUpdateServiceCategory;
