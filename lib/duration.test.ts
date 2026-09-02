import { describe, expect, it } from 'vitest';
import { formatDuration } from './duration';

describe('formatDuration', () => {
	it('deja en minutos lo que no llega a la hora', () => {
		expect(formatDuration(45)).toBe('45 min');
		expect(formatDuration(5)).toBe('5 min');
	});

	it('dice la hora en punto sin arrastrar los minutos', () => {
		expect(formatDuration(60)).toBe('1 h');
		expect(formatDuration(120)).toBe('2 h');
	});

	it('parte las dos unidades cuando hay resto', () => {
		expect(formatDuration(90)).toBe('1 h 30 min');
		expect(formatDuration(135)).toBe('2 h 15 min');
	});

	it('no rompe con lo que no es una duración', () => {
		// Una reserva sin servicios da 0, y un servicio que ya no existe puede
		// llegar sin duración: ninguno de los dos puede tumbar la fila.
		expect(formatDuration(0)).toBe('0 min');
		expect(formatDuration(-30)).toBe('0 min');
		expect(formatDuration(Number.NaN)).toBe('0 min');
	});
});
