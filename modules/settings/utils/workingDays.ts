import { DEFAULT_SETTINGS } from './constants';

/**
 * Traducción entre el orden de días del backend y el de la interfaz.
 *
 * El backend usa la convención de JavaScript, con el domingo en el índice 0,
 * porque es lo que devuelve `Date.getDay()` y lo que guarda `business_hours`. La
 * pantalla los lista de lunes a domingo, que es como los lee una persona.
 *
 * Ante un arreglo de largo distinto a 7 se devuelve el valor por defecto en vez
 * de rotar basura: un desfase acá se traduce en una barbería abierta el día
 * equivocado.
 */

/** Domingo primero → lunes primero. */
export const fromApiWorkingDays = (apiDays: boolean[]): boolean[] => {
	if (apiDays.length !== 7) return DEFAULT_SETTINGS.workingDays;

	const [sunday, ...mondayToSaturday] = apiDays;
	return [...mondayToSaturday, sunday];
};

/** Lunes primero → domingo primero. */
export const toApiWorkingDays = (uiDays: boolean[]): boolean[] => {
	if (uiDays.length !== 7) return DEFAULT_SETTINGS.workingDays;

	const sunday = uiDays[6];
	return [sunday, ...uiDays.slice(0, 6)];
};
