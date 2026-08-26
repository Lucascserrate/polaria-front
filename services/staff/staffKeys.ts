export const staffKeys = {
	all: ['staff'] as const,
	list: () => [...staffKeys.all, 'list'] as const,
	detail: (id: string) => [...staffKeys.all, 'detail', id] as const,
	working: (date?: string) =>
		[...staffKeys.all, 'working', date ?? 'today'] as const,
};
