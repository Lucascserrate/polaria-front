import type { ClientsQuery } from './clients.service';

export const clientKeys = {
	all: ['clients'] as const,
	list: (query: ClientsQuery) => [...clientKeys.all, 'list', query] as const,
	detail: (id: string) => [...clientKeys.all, 'detail', id] as const,
	summary: (id: string) => [...clientKeys.all, 'summary', id] as const,
	appointments: (id: string, page: number) =>
		[...clientKeys.all, 'appointments', id, page] as const,
};
