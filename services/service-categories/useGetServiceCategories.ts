import { useQuery } from '@tanstack/react-query';
import { getServiceCategories } from './serviceCategories.service';
import { serviceCategoryKeys } from './serviceCategoryKeys';
import type { ServiceCategory } from '@/types/service-categories.types';

const useGetServiceCategories = () => {
	return useQuery<ServiceCategory[]>({
		queryKey: serviceCategoryKeys.list(),
		queryFn: getServiceCategories,
	});
};

export default useGetServiceCategories;
