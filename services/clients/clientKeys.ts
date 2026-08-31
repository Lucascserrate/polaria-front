import type { ClientsQuery } from './clients.service';

export const clientKeys = {
	all: ['clients'] as const,
	/** Prefijo de todas las páginas de la lista, para invalidarlas juntas. */
	lists: () => [...clientKeys.all, 'list'] as const,
	list: (query: ClientsQuery) => [...clientKeys.lists(), query] as const,
	detail: (id: string) => [...clientKeys.all, 'detail', id] as const,
	summary: (id: string) => [...clientKeys.all, 'summary', id] as const,
	appointments: (id: string, page: number) =>
		[...clientKeys.all, 'appointments', id, page] as const,
};
