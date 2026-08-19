export const serviceKeys = {
	all: ['services'] as const,
	lists: () => [...serviceKeys.all, 'list'] as const,
	list: () => [...serviceKeys.lists()] as const,
	details: () => [...serviceKeys.all, 'detail'] as const,
	detail: (id: string) => [...serviceKeys.details(), id] as const,
};
