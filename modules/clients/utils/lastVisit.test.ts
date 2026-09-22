import { describe, expect, it } from 'vitest';
import { daysSinceVisit, formatLastVisit } from './lastVisit';

/** Un instante local de La Paz, que es la zona en la que corren los tests. */
const at = (date: string) => new Date(`${date}T12:00:00-04:00`);

describe('daysSinceVisit', () => {
	it('cuenta días de calendario, no vueltas de 24 horas', () => {
		// Anoche a las ocho: hace menos de un día entero, pero fue ayer.
		const visit = new Date('2026-09-20T20:00:00-04:00').toISOString();
		expect(daysSinceVisit(visit, new Date('2026-09-21T09:00:00-04:00'))).toBe(
			1,
		);
	});

	it('da cero el mismo día', () => {
		expect(
			daysSinceVisit(at('2026-09-21').toISOString(), at('2026-09-21')),
		).toBe(0);
	});
});

describe('formatLastVisit', () => {
	const now = at('2026-09-21');

	it('no dice nada de quien nunca vino', () => {
		expect(formatLastVisit(null, now)).toBeNull();
	});

	it('usa palabras para hoy y ayer', () => {
		expect(formatLastVisit(at('2026-09-21').toISOString(), now)).toBe('Hoy');
		expect(formatLastVisit(at('2026-09-20').toISOString(), now)).toBe('Ayer');
	});

	it('cuenta los días que el negocio mira', () => {
		// El ciclo de veintiún días con el que se decide a quién escribirle.
		expect(formatLastVisit(at('2026-08-31').toISOString(), now)).toBe(
			'Hace 21 días',
		);
	});

	it('deja de contar días pasado el año', () => {
		expect(formatLastVisit(at('2025-01-01').toISOString(), now)).toBe(
			'Hace más de un año',
		);
		expect(formatLastVisit(at('2023-01-01').toISOString(), now)).toBe(
			'Hace más de 3 años',
		);
	});
});
