/**
 * Fechas del calendario como `YYYY-MM-DD`.
 *
 * Es el formato que espera el backend, que las interpreta en la zona horaria
 * del negocio. Acá se construyen y se leen siempre con los getters locales,
 * nunca con `new Date('2026-08-18')`: esa forma se parsea como UTC y en
 * cualquier zona al oeste de Greenwich devuelve el día anterior, que es
 * exactamente el error que un panel de agenda no puede cometer.
 */

export const toDateKey = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
};

/** Medianoche local del día indicado. */
export const parseDateKey = (key: string): Date => {
	const [year, month, day] = key.split('-').map(Number);
	return new Date(year, month - 1, day);
};

export const todayKey = (): string => toDateKey(new Date());

const longDateFormatter = new Intl.DateTimeFormat('es', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
});

/** `martes 18 de agosto`, para encabezados. */
export const formatLongDate = (key: string): string =>
	longDateFormatter.format(parseDateKey(key));
