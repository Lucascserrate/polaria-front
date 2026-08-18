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

const relativeFormatter = new Intl.RelativeTimeFormat('es', {
	numeric: 'auto',
});

/**
 * `hace 5 minutos` a partir de un instante ISO.
 *
 * Se recalcula en cada render, así que solo se mantiene al día donde algo vuelve
 * a renderizar —un refetch periódico, por ejemplo—. Para una espera que se mide
 * en minutos alcanza; para un reloj no serviría.
 */
export const formatTimeAgo = (iso: string, now: number = Date.now()): string => {
	const elapsedMs = now - new Date(iso).getTime();
	const minutes = Math.round(elapsedMs / 60_000);

	if (minutes < 1) return 'hace un momento';
	if (minutes < 60) return relativeFormatter.format(-minutes, 'minute');

	const hours = Math.round(minutes / 60);
	if (hours < 24) return relativeFormatter.format(-hours, 'hour');

	return relativeFormatter.format(-Math.round(hours / 24), 'day');
};
