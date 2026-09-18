export const serviceCategoryKeys = {
	all: ['service-categories'] as const,
	lists: () => [...serviceCategoryKeys.all, 'list'] as const,
	list: () => [...serviceCategoryKeys.lists()] as const,
};
