import { describe, expect, it } from 'vitest';
import { blockSchemeOf, soleStaffOf } from './blockColor';
import { schemeOf } from '@/modules/team/utils/colors';

const seg = (staffId: string | null, staffColor?: string | null) => ({
	staffId,
	staffColor,
});

describe('soleStaffOf', () => {
	it('con un solo profesional, es de él', () => {
		expect(soleStaffOf([seg('a', 'coral')])?.staffId).toBe('a');
	});

	it('dos tramos de la misma persona siguen siendo de ella', () => {
		expect(soleStaffOf([seg('a', 'coral'), seg('a', 'coral')])?.staffId).toBe(
			'a',
		);
	});

	/*
	 * La regla que motivó esta función. Pintar una cita compartida con el color de
	 * uno de los dos se la atribuye, y el color existe para responder de quién es:
	 * una respuesta equivocada es peor que ninguna.
	 */
	it('una cita compartida no es de nadie', () => {
		expect(soleStaffOf([seg('a', 'coral'), seg('b', 'teal')])).toBeNull();
	});

	it('sin profesional asignado, tampoco', () => {
		expect(soleStaffOf([seg(null)])).toBeNull();
		expect(soleStaffOf([])).toBeNull();
	});

	/*
	 * En la vista por profesional el bloque ya sabe de quién es su columna, así que
	 * una cita compartida sí tiene dueño **en esa columna**: el tramo que va ahí.
	 */
	it('con la columna dada, toma el tramo de esa columna', () => {
		const segments = [seg('a', 'coral'), seg('b', 'teal')];

		expect(soleStaffOf(segments, 'b')?.staffColor).toBe('teal');
	});

	it('si la columna no tiene tramo, no hay dueño', () => {
		expect(soleStaffOf([seg('a', 'coral')], 'z')).toBeNull();
	});
});

describe('blockSchemeOf', () => {
	it('devuelve el esquema del color elegido', () => {
		expect(blockSchemeOf([seg('a', 'coral')])).toEqual(schemeOf('coral'));
	});

	/*
	 * Un equipo que nunca configuró colores igual tiene que distinguirse: el color
	 * cae al derivado del id, que es estable.
	 */
	it('sin color elegido usa el derivado del id, no null', () => {
		const scheme = blockSchemeOf([seg('staff-42', null)]);

		expect(scheme).not.toBeNull();
		expect(scheme).toEqual(blockSchemeOf([seg('staff-42', null)]));
	});

	it('sin dueño no hay esquema', () => {
		expect(blockSchemeOf([seg('a'), seg('b')])).toBeNull();
		expect(blockSchemeOf([])).toBeNull();
	});
});
