import { describe, expect, it } from 'vitest';
import { isBetweenRange, nextRangeSelection } from './dateRange';

describe('nextRangeSelection', () => {
	it('deja el rango a medias con el primer click', () => {
		expect(
			nextRangeSelection({ from: '2026-08-01', to: null }, '2026-08-10'),
		).toEqual({ from: '2026-08-01', to: '2026-08-10' });
	});

	it('arma el mismo rango sin importar el orden de los clicks', () => {
		const adelante = nextRangeSelection(
			{ from: '2026-08-05', to: null },
			'2026-08-20',
		);
		const alReves = nextRangeSelection(
			{ from: '2026-08-20', to: null },
			'2026-08-05',
		);

		expect(adelante).toEqual({ from: '2026-08-05', to: '2026-08-20' });
		expect(alReves).toEqual(adelante);
	});

	it('nunca produce un rango invertido', () => {
		const rango = nextRangeSelection(
			{ from: '2026-08-20', to: null },
			'2026-07-30',
		);
		expect(rango.from <= (rango.to as string)).toBe(true);
	});

	it('acepta un solo día como rango', () => {
		expect(
			nextRangeSelection({ from: '2026-08-09', to: null }, '2026-08-09'),
		).toEqual({ from: '2026-08-09', to: '2026-08-09' });
	});

	it('empieza de nuevo cuando el rango ya estaba completo', () => {
		expect(
			nextRangeSelection(
				{ from: '2026-08-01', to: '2026-08-31' },
				'2026-09-15',
			),
		).toEqual({ from: '2026-09-15', to: null });
	});

	it('cruza el fin de año sin romperse', () => {
		expect(
			nextRangeSelection({ from: '2027-01-05', to: null }, '2026-12-28'),
		).toEqual({ from: '2026-12-28', to: '2027-01-05' });
	});
});

describe('isBetweenRange', () => {
	it('no pinta los extremos, que se dibujan aparte', () => {
		expect(isBetweenRange('2026-08-01', '2026-08-01', '2026-08-05')).toBe(
			false,
		);
		expect(isBetweenRange('2026-08-05', '2026-08-01', '2026-08-05')).toBe(
			false,
		);
	});

	it('pinta lo que queda en el medio', () => {
		expect(isBetweenRange('2026-08-03', '2026-08-01', '2026-08-05')).toBe(true);
	});

	it('no pinta nada mientras falte el segundo extremo', () => {
		expect(isBetweenRange('2026-08-03', '2026-08-01', null)).toBe(false);
	});

	it('deja afuera lo que está fuera del rango', () => {
		expect(isBetweenRange('2026-08-09', '2026-08-01', '2026-08-05')).toBe(
			false,
		);
		expect(isBetweenRange('2026-07-30', '2026-08-01', '2026-08-05')).toBe(
			false,
		);
	});
});
