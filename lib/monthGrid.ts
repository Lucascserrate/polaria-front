/**
 * La grilla de un mes: qué celdas van y en qué columna cae cada día.
 *
 * Vive acá y no dentro de un calendario porque hay dos que la dibujan —el de un
 * día y el de un rango— y el cálculo tiene una sola parte sutil, que es
 * exactamente la que se copiaría mal: la semana arranca el lunes y
 * `Date.getDay()` cuenta desde el domingo. Con el índice sin correr, todo el mes
 * queda desplazado una columna y se ve perfectamente normal.
 */

import { toDateKey } from './date';

/** La semana arranca el lunes, igual que la grilla de horarios de Configuración. */
export const WEEKDAY_LABELS = [
	'Lun',
	'Mar',
	'Mié',
	'Jue',
	'Vie',
	'Sáb',
	'Dom',
] as const;

export interface MonthGrid {
	/** Celdas vacías antes del día 1, para que caiga en su columna. */
	leadingBlanks: number;
	/** Los días del mes en orden, como `YYYY-MM-DD`. */
	days: string[];
}

export const buildMonthGrid = (year: number, month: number): MonthGrid => {
	// El día 0 del mes siguiente es el último de este.
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	return {
		leadingBlanks: (new Date(year, month, 1).getDay() + 6) % 7,
		days: Array.from({ length: daysInMonth }, (_, index) =>
			toDateKey(new Date(year, month, index + 1)),
		),
	};
};

/**
 * Primer día del mes, como `Date` local.
 *
 * Se construye con los componentes y no con `new Date(key)`: esa forma se parsea
 * como UTC y al oeste de Greenwich devuelve el mes anterior el día 1.
 */
export const startOfMonth = (year: number, month: number): Date =>
	new Date(year, month, 1);

/** El mes corrido `delta` meses. Los desbordes de año los resuelve `Date`. */
export const shiftMonth = (from: Date, delta: number): Date =>
	new Date(from.getFullYear(), from.getMonth() + delta, 1);
