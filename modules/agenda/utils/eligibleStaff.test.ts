import { describe, expect, it } from 'vitest';
import { eligibleStaffFor } from './eligibleStaff';

const member = (
	overrides: Partial<Parameters<typeof eligibleStaffFor>[0][0]>,
) => ({
	id: 'staff-1',
	name: 'Marco',
	isActive: true,
	services: [{ id: 'corte' }],
	...overrides,
});

describe('eligibleStaffFor', () => {
	it('ofrece a quien atiende y tiene el servicio', () => {
		expect(eligibleStaffFor([member({})], 'corte')).toHaveLength(1);
	});

	it('no ofrece a quien no tiene el servicio', () => {
		expect(eligibleStaffFor([member({})], 'barba')).toHaveLength(0);
	});

	it('no ofrece a quien está inactivo', () => {
		expect(
			eligibleStaffFor([member({ isActive: false })], 'corte'),
		).toHaveLength(0);
	});

	/*
	 * El caso que motivó el rediseño: un administrativo con servicios cargados no
	 * puede aparecer entre los profesionales de una reserva. El backend lo
	 * rechazaría al guardar, pero para entonces ya se lo ofreció.
	 */
	it('no ofrece al administrador que no atiende, aunque tenga el servicio', () => {
		expect(
			eligibleStaffFor([member({ providesServices: false })], 'corte'),
		).toHaveLength(0);
	});

	it('sí ofrece al dueño que además atiende', () => {
		expect(
			eligibleStaffFor([member({ providesServices: true })], 'corte'),
		).toHaveLength(1);
	});

	// Los datos anteriores a la migración no traían el campo, y todos eran
	// reservables: ausente tiene que significar que sí atiende.
	it('trata la ausencia del campo como que atiende', () => {
		expect(
			eligibleStaffFor([member({ providesServices: undefined })], 'corte'),
		).toHaveLength(1);
	});

	it('sin servicio elegido no ofrece a nadie', () => {
		expect(eligibleStaffFor([member({})], null)).toHaveLength(0);
	});
});
