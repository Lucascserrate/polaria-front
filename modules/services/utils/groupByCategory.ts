import type { Service } from '@/types/services.types';
import type { ServiceCategory } from '@/types/service-categories.types';

export interface ServiceGroup {
	/** `null` es el grupo de los que no están en ninguna categoría. */
	category: ServiceCategory | null;
	services: Service[];
}

/** El encabezado del grupo de los que no tienen categoría. */
export const UNCATEGORIZED_LABEL = 'Sin categoría';

/**
 * Reparte el catálogo en sus grupos, listos para dibujar.
 *
 * El orden lo ponen las categorías, que ya vienen ordenadas del servidor, y el
 * grupo sin categoría va **último**: es un cajón, no una categoría más, y arriba
 * empujaría hacia abajo a las que el negocio armó a propósito.
 *
 * Las categorías vacías se devuelven igual, con su lista en cero. Quien acaba de
 * crear "Uñas" necesita verla para meterle algo, y una categoría que aparece
 * recién cuando ya tiene contenido es una que parece que no se creó.
 *
 * Un servicio cuya categoría no está en la lista cae en el cajón en lugar de
 * desaparecer. Pasa de verdad: entre que alguien borra una categoría en otra
 * pestaña y esta recarga, hay servicios apuntando a un id que ya no existe, y el
 * catálogo no puede perder filas por eso.
 */
export const groupByCategory = (
	services: Service[],
	categories: ServiceCategory[],
): ServiceGroup[] => {
	const groups = new Map<string, Service[]>(
		categories.map((category) => [category.id, []]),
	);
	const uncategorized: Service[] = [];

	for (const service of services) {
		const group = service.categoryId
			? groups.get(service.categoryId)
			: undefined;
		(group ?? uncategorized).push(service);
	}

	const result: ServiceGroup[] = categories.map((category) => ({
		category,
		services: groups.get(category.id) ?? [],
	}));

	if (uncategorized.length > 0) {
		result.push({ category: null, services: uncategorized });
	}

	return result;
};
