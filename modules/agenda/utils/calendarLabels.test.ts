import { describe, expect, it } from 'vitest';
import {
	dayNumber,
	describeDay,
	describeWeek,
	weekdayLabel,
} from './calendarLabels';
import { weekDaysOf } from './calendarLayout';

/*
 * Estos tests corren con `TZ=America/La_Paz` —ver `vitest.config.mts`— porque es
 * la única forma de que sirvan: en una máquina en UTC pasaban igual con el error
 * adentro. Una fecha del calendario se representa como medianoche UTC, y leerla
 * en una zona al oeste devuelve el día anterior.
 */

describe('describeDay', () => {
	it('nombra el día correcto al oeste de Greenwich', () => {
		// El 23 de agosto de 2026 es domingo. Formateado sin decir la zona, en
		// Bolivia se leía "sábado 22": la barra decía un día y la grilla mostraba
		// otro.
		expect(describeDay('2026-08-23')).toBe('Domingo, 23 de agosto');
	});

	it('acierta el primero de mes, que es donde el corrimiento se nota', () => {
		expect(describeDay('2026-09-01')).toBe('Martes, 1 de septiembre');
	});

	it('acierta el primero de enero', () => {
		expect(describeDay('2027-01-01')).toBe('Viernes, 1 de enero');
	});
});

describe('weekdayLabel', () => {
	it('devuelve el día de la semana de esa fecha', () => {
		expect(weekdayLabel('2026-08-17')).toBe('lun');
		expect(weekdayLabel('2026-08-23')).toBe('dom');
	});

	it('no arrastra el punto del locale', () => {
		expect(weekdayLabel('2026-08-17')).not.toContain('.');
	});
});

describe('dayNumber', () => {
	it('es el número de la fecha, sin corrimiento', () => {
		expect(dayNumber('2026-08-23')).toBe(23);
		expect(dayNumber('2026-09-01')).toBe(1);
	});

	it('coincide con la etiqueta del mismo día', () => {
		// La cabecera muestra los dos juntos: si salieran de zonas distintas,
		// diría "sáb 23" sobre una columna que es domingo.
		for (const day of weekDaysOf('2026-08-22')) {
			expect(describeDay(day)).toContain(String(dayNumber(day)));
		}
	});
});

describe('describeWeek', () => {
	it('dice el mes una vez cuando la semana no lo cruza', () => {
		expect(describeWeek(weekDaysOf('2026-08-22'))).toBe(
			'17 – 23 de agosto de 2026',
		);
	});

	it('nombra los dos meses cuando la semana está partida', () => {
		expect(describeWeek(weekDaysOf('2026-09-01'))).toBe(
			'31 de agosto – 6 de septiembre de 2026',
		);
	});

	it('nombra los dos años en la semana que cruza el año', () => {
		expect(describeWeek(weekDaysOf('2026-12-31'))).toBe(
			'28 de diciembre de 2026 – 3 de enero de 2027',
		);
	});
});
