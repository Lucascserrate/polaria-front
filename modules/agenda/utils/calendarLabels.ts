/**
 * Cómo se escriben las fechas del calendario.
 *
 * Todo acá formatea **en UTC**, y no es un detalle: una fecha del calendario no
 * tiene hora ni huso, se representa como la medianoche UTC de ese día, y
 * formatearla sin decir la zona la lee en la del navegador. Al oeste de
 * Greenwich eso devuelve el día anterior, así que la agenda mostraba los datos
 * correctos con el nombre del día equivocado: la barra decía "domingo" mientras
 * la grilla mostraba el lunes.
 *
 * Es el mismo error contra el que advierte `lib/date.ts`, del otro lado: ahí se
 * construyen las fechas en local y se formatean en local; acá se construyen en
 * UTC y se formatean en UTC. Lo que no se puede es mezclar.
 */

const UTC = 'UTC';

const longDay = new Intl.DateTimeFormat('es', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
	timeZone: UTC,
});

const shortWeekday = new Intl.DateTimeFormat('es', {
	weekday: 'short',
	timeZone: UTC,
});

const dayMonth = new Intl.DateTimeFormat('es', {
	day: 'numeric',
	month: 'long',
	timeZone: UTC,
});

const dayOnly = new Intl.DateTimeFormat('es', {
	day: 'numeric',
	timeZone: UTC,
});

const monthYear = new Intl.DateTimeFormat('es', {
	month: 'long',
	year: 'numeric',
	timeZone: UTC,
});

/** La medianoche UTC de una fecha `YYYY-MM-DD`. */
export const utcDateOf = (key: string): Date => {
	const [year, month, day] = key.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day));
};

const capitalize = (value: string) =>
	value.charAt(0).toUpperCase() + value.slice(1);

/** `Sábado 22 de agosto`, para la barra en vista diaria. */
export const describeDay = (key: string): string =>
	capitalize(longDay.format(utcDateOf(key)));

/** `sáb`, sin el punto que agrega el locale. */
export const weekdayLabel = (key: string): string =>
	shortWeekday.format(utcDateOf(key)).replace('.', '');

/** El número del día, para la cabecera de la columna. */
export const dayNumber = (key: string): number => utcDateOf(key).getUTCDate();

/**
 * El rango de una semana.
 *
 * Se dice el mes una sola vez cuando los siete días caen en el mismo: "17 – 23
 * de agosto de 2026" se lee mejor que repetirlo, y cuando la semana está partida
 * entre dos meses —o entre dos años— hay que decirlo igual.
 */
export const describeWeek = (days: string[]): string => {
	const first = utcDateOf(days[0]);
	const last = utcDateOf(days[days.length - 1]);

	const sameYear = first.getUTCFullYear() === last.getUTCFullYear();
	const sameMonth = sameYear && first.getUTCMonth() === last.getUTCMonth();

	if (sameMonth) {
		return `${dayOnly.format(first)} – ${dayOnly.format(last)} de ${monthYear.format(first)}`;
	}

	return sameYear
		? `${dayMonth.format(first)} – ${dayMonth.format(last)} de ${first.getUTCFullYear()}`
		: `${dayMonth.format(first)} de ${first.getUTCFullYear()} – ${dayMonth.format(last)} de ${last.getUTCFullYear()}`;
};
