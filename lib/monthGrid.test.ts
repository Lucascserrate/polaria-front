import { describe, expect, it } from 'vitest';
import { buildMonthGrid, shiftMonth, WEEKDAY_LABELS } from './monthGrid';

describe('buildMonthGrid', () => {
	it('pone el día 1 en la columna de su día de semana, contando desde el lunes', () => {
		// El 1 de agosto de 2026 cae sábado, la sexta columna: cinco vacías antes.
		expect(buildMonthGrid(2026, 7).leadingBlanks).toBe(5);
		// El 1 de junio de 2026 cae lunes: ninguna.
		expect(buildMonthGrid(2026, 5).leadingBlanks).toBe(0);
		// El 1 de noviembre de 2026 cae domingo, que es la última columna.
		expect(buildMonthGrid(2026, 10).leadingBlanks).toBe(6);
	});

	it('nunca deja el mes fuera de la grilla', () => {
		expect(buildMonthGrid(2026, 7).leadingBlanks).toBeLessThan(
			WEEKDAY_LABELS.length,
		);
	});

	it('cuenta los días de cada mes, febrero bisiesto incluido', () => {
		expect(buildMonthGrid(2026, 0).days).toHaveLength(31);
		expect(buildMonthGrid(2026, 3).days).toHaveLength(30);
		expect(buildMonthGrid(2026, 1).days).toHaveLength(28);
		expect(buildMonthGrid(2028, 1).days).toHaveLength(29);
	});

	it('numera los días como claves locales, sin correrse por zona horaria', () => {
		const { days } = buildMonthGrid(2026, 7);
		expect(days[0]).toBe('2026-08-01');
		expect(days.at(-1)).toBe('2026-08-31');
	});
});

describe('shiftMonth', () => {
	it('cruza el fin de año en los dos sentidos', () => {
		const diciembre = shiftMonth(new Date(2026, 11, 1), 1);
		expect([diciembre.getFullYear(), diciembre.getMonth()]).toEqual([2027, 0]);

		const enero = shiftMonth(new Date(2026, 0, 1), -1);
		expect([enero.getFullYear(), enero.getMonth()]).toEqual([2025, 11]);
	});

	it('siempre cae en el día 1, venga de donde venga', () => {
		expect(shiftMonth(new Date(2026, 0, 31), 1).getDate()).toBe(1);
	});
});
