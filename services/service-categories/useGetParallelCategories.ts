import { useQuery } from '@tanstack/react-query';
import { getParallelCategories } from './schedulingRules.service';
import { serviceCategoryKeys } from './serviceCategoryKeys';

/** Con qué otras categorías se puede atender ésta al mismo tiempo. */
const useGetParallelCategories = (categoryId: string | null) =>
	useQuery<string[]>({
		queryKey: serviceCategoryKeys.parallel(categoryId ?? ''),
		queryFn: () => getParallelCategories(categoryId as string),
		enabled: !!categoryId,
	});

export default useGetParallelCategories;
