import { describe, expect, it } from 'vitest';
import { comparisonLabel, formatMonth, periodLabel } from './format';

describe('formatMonth', () => {
	it('nombra el mes de la fecha, no el del navegador', () => {
		expect(formatMonth('2026-08-09')).toBe('agosto');
		expect(formatMonth('2026-12-31')).toBe('diciembre');
	});
});

describe('periodLabel', () => {
	const august = { from: '2026-08-01', to: '2026-08-31' };

	it('nombra los presets en vez de escribir sus fechas', () => {
		expect(periodLabel('today', { from: '2026-08-09', to: '2026-08-09' })).toBe(
			'Hoy',
		);
		expect(periodLabel('week', { from: '2026-08-03', to: '2026-08-09' })).toBe(
			'Esta semana',
		);
		expect(periodLabel('month', august)).toBe('Agosto');
	});

	it('escribe con fechas el rango a medida, que no tiene otro nombre', () => {
		expect(periodLabel('custom', { from: '2026-08-03', to: '2026-08-09' })).toBe(
			'3 ago 2026 – 9 ago 2026',
		);
	});
});

describe('comparisonLabel', () => {
	it('nombra el período anterior como se lo diría en voz alta', () => {
		expect(
			comparisonLabel('today', { from: '2026-08-08', to: '2026-08-08' }),
		).toBe('ayer');
		expect(
			comparisonLabel('week', { from: '2026-07-27', to: '2026-08-02' }),
		).toBe('la semana pasada');
		expect(
			comparisonLabel('month', { from: '2026-07-01', to: '2026-07-31' }),
		).toBe('julio');
	});
});
