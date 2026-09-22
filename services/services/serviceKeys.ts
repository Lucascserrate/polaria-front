import type { ServiceScope } from '@/types/services.types';

export const serviceKeys = {
	all: ['services'] as const,
	lists: () => [...serviceKeys.all, 'list'] as const,
	/**
	 * El alcance entra en la clave: el catálogo con los desactivados y el de sólo
	 * activos son dos respuestas distintas y no pueden compartir entrada. Quien
	 * invalida lo hace por `all` o por `lists()`, que alcanzan a las dos.
	 */
	list: (scope: ServiceScope = 'active') =>
		[...serviceKeys.lists(), scope] as const,
	details: () => [...serviceKeys.all, 'detail'] as const,
	detail: (id: string) => [...serviceKeys.details(), id] as const,
};
