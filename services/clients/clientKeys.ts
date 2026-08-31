import type { ClientsQuery } from './clients.service';

export const clientKeys = {
	all: ['clients'] as const,
	list: (query: ClientsQuery) => [...clientKeys.all, 'list', query] as const,
	detail: (id: string) => [...clientKeys.all, 'detail', id] as const,
};
