import { describe, expect, it } from 'vitest';
import { splitServicesByStaff } from './servicesByStaff';

const CORTE = { id: 'corte' };
const COLOR = { id: 'color' };
const MANICURA = { id: 'manicura' };

const SERVICES = [CORTE, COLOR, MANICURA];

const ana = {
	id: 'ana',
	name: 'Ana',
	isActive: true,
	services: [{ id: 'corte' }, { id: 'color' }],
};

const juan = {
	id: 'juan',
	name: 'Juan',
	isActive: true,
	services: [{ id: 'manicura' }],
};

const STAFF = [ana, juan];

describe('splitServicesByStaff', () => {
	it('separa lo que hace el profesional de lo que no', () => {
		const { own, rest } = splitServicesByStaff(SERVICES, STAFF, 'ana');

		expect(own).toEqual([CORTE, COLOR]);
		expect(rest).toEqual([MANICURA]);
	});

	it('sin profesional preferido, todo queda en la lista de siempre', () => {
		// Es la reserva que arranca del botón de la barra: no salió de ninguna
		// columna, así que no hay de quién separar.
		const { own, rest } = splitServicesByStaff(SERVICES, STAFF, null);

		expect(own).toEqual([]);
		expect(rest).toEqual(SERVICES);
	});

	it('un profesional sin servicios asignados no se queda con ninguno', () => {
		const nadie = { id: 'nadie', name: 'Nadie', isActive: true, services: [] };
		const { own, rest } = splitServicesByStaff(
			SERVICES,
			[...STAFF, nadie],
			'nadie',
		);

		expect(own).toEqual([]);
		expect(rest).toEqual(SERVICES);
	});

	/*
	 * El mismo criterio que el resto de la reserva: alguien dado de baja no puede
	 * hacer nada, aunque el servicio le siga figurando asignado.
	 */
	it('un profesional inactivo no se queda con sus servicios', () => {
		const { own, rest } = splitServicesByStaff(
			SERVICES,
			[{ ...ana, isActive: false }, juan],
			'ana',
		);

		expect(own).toEqual([]);
		expect(rest).toEqual(SERVICES);
	});

	it('conserva el orden del catálogo dentro de cada grupo', () => {
		const todoAna = { ...ana, services: SERVICES.map((s) => ({ id: s.id })) };
		const { own } = splitServicesByStaff(SERVICES, [todoAna], 'ana');

		expect(own).toEqual(SERVICES);
	});
});
