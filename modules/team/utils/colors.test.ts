import { describe, expect, it } from 'vitest';
import {
	colorOf,
	contrastRatio,
	INK,
	PAPER,
	schemeOf,
	TEAM_COLOR_LABELS,
	TEAM_COLORS,
} from './colors';

describe('colorOf', () => {
	it('respeta el color elegido', () => {
		expect(colorOf({ id: 'a', calendarColor: 'coral' })).toBe('coral');
	});

	it('sin color elegido, el mismo id da siempre el mismo color', () => {
		expect(colorOf({ id: 'staff-42' })).toBe(colorOf({ id: 'staff-42' }));
	});

	/*
	 * Un token que ya no está en la paleta no puede dejar a alguien sin color: es lo
	 * que permite sacar un color de la lista sin migrar las fichas que lo tenían.
	 */
	it('ignora un token que no está en la paleta', () => {
		expect(TEAM_COLORS).not.toContain('chartreuse');
		expect(TEAM_COLORS).toContain(
			colorOf({ id: 'a', calendarColor: 'chartreuse' }),
		);
	});

	it('sin id tampoco se rompe', () => {
		expect(TEAM_COLORS).toContain(colorOf({}));
	});
});

describe('la paleta', () => {
	it('no repite colores', () => {
		const hexes = TEAM_COLORS.map((color) => schemeOf(color).hex);
		expect(new Set(hexes).size).toBe(TEAM_COLORS.length);
	});

	it('tiene nombre para cada color', () => {
		for (const color of TEAM_COLORS) {
			expect(TEAM_COLOR_LABELS[color]).toBeTruthy();
		}
	});

	/*
	 * El token viaja a una columna `varchar(16)`. Un nombre más largo se guardaría
	 * truncado y al volver no coincidiría con ninguno de la paleta, así que la
	 * persona perdería su color sin que nada fallara a la vista.
	 */
	it('los tokens entran en la columna', () => {
		for (const color of TEAM_COLORS) {
			expect(color.length).toBeLessThanOrEqual(16);
		}
	});
});

describe('el relleno', () => {
	it('lleva las iniciales en blanco en toda la paleta', () => {
		for (const color of TEAM_COLORS) {
			expect(schemeOf(color).on).toBe(PAPER);
		}
	});

	/*
	 * El blanco sobre estos tonos no llega a AA y es una decisión tomada a
	 * conciencia —ver `ON_FILL`—, así que no hay un mínimo de contraste que exigir
	 * acá. Lo que sí hay que impedir es que entre un color **más claro que `lime`**:
	 * ese es el piso en el que las iniciales todavía se distinguen, y por encima
	 * desaparecerían del todo.
	 */
	it('ningún color es más claro que lime, que es el piso', () => {
		const limeContrast = contrastRatio(schemeOf('lime').hex, PAPER);

		for (const color of TEAM_COLORS) {
			expect(contrastRatio(schemeOf(color).hex, PAPER)).toBeGreaterThanOrEqual(
				limeContrast,
			);
		}
	});
});

describe('el texto de una cita sobre su fondo tenue', () => {
	/**
	 * Mínimo de WCAG AA para texto normal.
	 *
	 * Acá sí se exige, a diferencia del relleno: esto es el nombre y el servicio de
	 * una cita, o sea información que no está repetida en ningún otro lado.
	 */
	const AA = 4.5;

	it('se lee en tema claro', () => {
		for (const color of TEAM_COLORS) {
			expect(
				contrastRatio(schemeOf(color).strong, PAPER),
			).toBeGreaterThanOrEqual(AA);
		}
	});

	it('y también en tema oscuro', () => {
		for (const color of TEAM_COLORS) {
			expect(contrastRatio(schemeOf(color).soft, INK)).toBeGreaterThanOrEqual(
				AA,
			);
		}
	});
});
