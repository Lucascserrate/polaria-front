import type { TimelineGranularity } from '@/types/reports.types';

/**
 * Cómo se escriben los tramos de la evolución.
 *
 * Se formatea **en UTC** sobre la clave del tramo, que es una fecha calendaria
 * sin hora ni huso. Leerla en la zona del navegador devolvería el día anterior al
 * oeste de Greenwich, que es el mismo error que corrimos en la agenda: el eje
 * diría "8" sobre la barra del 9.
 */

const UTC = 'UTC';

const dayAxis = new Intl.DateTimeFormat('es', { day: 'numeric', timeZone: UTC });

const dayFull = new Intl.DateTimeFormat('es', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
	timeZone: UTC,
});

const monthAxis = new Intl.DateTimeFormat('es', {
	month: 'short',
	timeZone: UTC,
});

const monthFull = new Intl.DateTimeFormat('es', {
	month: 'long',
	year: 'numeric',
	timeZone: UTC,
});

/** `YYYY-MM-DD` o `YYYY-MM` a su instante de mediodía UTC, seguro de formatear. */
const dateOf = (key: string): Date => {
	const [year, month, day] = key.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day ?? 1, 12));
};

/**
 * La etiqueta del eje: corta, porque hay una por barra.
 *
 * En días es solo el número. El mes va en el encabezado del período, así que
 * repetirlo treinta veces gasta ancho sin agregar nada.
 */
export const bucketAxisLabel = (
	key: string,
	granularity: TimelineGranularity,
): string => {
	const date = dateOf(key);

	return granularity === 'day'
		? dayAxis.format(date)
		: monthAxis.format(date).replace('.', '');
};

/** La etiqueta del tooltip: completa, porque es la que se lee de a una. */
export const bucketFullLabel = (
	key: string,
	granularity: TimelineGranularity,
): string => {
	const date = dateOf(key);
	const label =
		granularity === 'day' ? dayFull.format(date) : monthFull.format(date);

	return label.charAt(0).toUpperCase() + label.slice(1);
};
