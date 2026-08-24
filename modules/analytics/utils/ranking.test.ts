import { describe, expect, it } from 'vitest';
import { maxOf, shareOfMax } from './ranking';

describe('shareOfMax', () => {
	it('el mayor ocupa la barra entera', () => {
		expect(shareOfMax(2100, 2100)).toBe(1);
	});

	it('el resto ocupa su proporción contra el mayor', () => {
		expect(shareOfMax(1050, 2100)).toBe(0.5);
	});

	it('sin facturación las barras quedan en cero, no en NaN', () => {
		// Un período sin nada facturado tiene máximo cero: dividir daría `NaN` y
		// un ancho inválido.
		expect(shareOfMax(0, 0)).toBe(0);
	});

	it('nunca se pasa del ancho ni queda negativo', () => {
		expect(shareOfMax(3000, 2100)).toBe(1);
		expect(shareOfMax(-500, 2100)).toBe(0);
	});

	it('tolera valores que no son números', () => {
		expect(shareOfMax(Number.NaN, 100)).toBe(0);
		expect(shareOfMax(100, Number.NaN)).toBe(0);
	});
});

describe('maxOf', () => {
	it('devuelve el mayor de la lista', () => {
		expect(maxOf([{ v: 10 }, { v: 40 }, { v: 25 }], (e) => e.v)).toBe(40);
	});

	it('una lista vacía no tiene máximo', () => {
		expect(maxOf([], (e: { v: number }) => e.v)).toBe(0);
	});

	it('ignora valores negativos, que no dibujan barra', () => {
		expect(maxOf([{ v: -5 }, { v: -1 }], (e) => e.v)).toBe(0);
	});
});
