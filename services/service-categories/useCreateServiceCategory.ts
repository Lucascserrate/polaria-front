import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createServiceCategory } from './serviceCategories.service';
import { serviceCategoryKeys } from './serviceCategoryKeys';
import type { CreateServiceCategoryDto } from '@/types/service-categories.types';

const useCreateServiceCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateServiceCategoryDto) =>
			createServiceCategory(input),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: serviceCategoryKeys.all });
		},
		onError: (error) => {
			console.error('Error creating service category:', error);
		},
	});
};

export default useCreateServiceCategory;
