import { describe, expect, it } from 'vitest';

import { groupByCategory } from './groupByCategory';
import type { Service } from '@/types/services.types';
import type { ServiceCategory } from '@/types/service-categories.types';

const category = (id: string, name: string, position: number) =>
	({ id, name, position }) as ServiceCategory;

const service = (id: string, categoryId?: string | null) =>
	({ id, name: id, categoryId, durationMinutes: 30, price: 25 }) as Service;

describe('groupByCategory', () => {
	it('respeta el orden en que vienen las categorías', () => {
		// El servidor ya las ordenó por `position`: reordenarlas acá sería ignorar
		// el orden que el negocio eligió para su menú.
		const groups = groupByCategory(
			[],
			[category('b', 'Uñas', 0), category('a', 'Cabello', 1)],
		);

		expect(groups.map((group) => group.category?.id)).toEqual(['b', 'a']);
	});

	it('devuelve las categorías vacías', () => {
		const groups = groupByCategory([], [category('a', 'Uñas', 0)]);

		expect(groups).toHaveLength(1);
		expect(groups[0].services).toEqual([]);
	});

	it('los que no tienen categoría van últimos, en su propio grupo', () => {
		const groups = groupByCategory(
			[service('suelto'), service('agrupado', 'a')],
			[category('a', 'Cabello', 0)],
		);

		expect(groups.at(-1)?.category).toBeNull();
		expect(groups.at(-1)?.services.map((s) => s.id)).toEqual(['suelto']);
	});

	it('sin nadie suelto no aparece el grupo sin categoría', () => {
		const groups = groupByCategory(
			[service('agrupado', 'a')],
			[category('a', 'Cabello', 0)],
		);

		expect(groups).toHaveLength(1);
	});

	it('un servicio de una categoría que ya no existe no se pierde', () => {
		// Pasa entre que alguien borra una categoría en otra pestaña y esta
		// recarga: el catálogo no puede quedarse sin filas por eso.
		const groups = groupByCategory([service('huérfano', 'borrada')], []);

		expect(groups).toHaveLength(1);
		expect(groups[0].category).toBeNull();
		expect(groups[0].services.map((s) => s.id)).toEqual(['huérfano']);
	});

	it('sin servicios ni categorías no hay grupos', () => {
		expect(groupByCategory([], [])).toEqual([]);
	});
});
