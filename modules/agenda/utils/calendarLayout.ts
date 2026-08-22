/**
 * Geometría del calendario: en qué píxel cae cada minuto y cómo se reparten las
 * citas que se pisan.
 *
 * Todo acá es puro y sin React a propósito: es la parte que se rompe en
 * silencio. Una cita mal ubicada no lanza ningún error, solo aparece en el día
 * equivocado o media hora más arriba, y eso hay que poder probarlo sin montar
 * una pantalla.
 *
 * La decisión de fondo es que el lienzo son **siempre las 24 horas**, iguales
 * para todos los días. Los períodos cerrados se dibujan encima como bloques, no
 * se recortan de la grilla. Así `top` es literalmente el minuto: comparar el
 * sábado que cierra a las 13:00 con el lunes que cierra a las 19:00 no necesita
 * ninguna condición, porque lo único que cambia entre columnas es el sombreado,
 * que es dato y no estructura.
 */

/** Minutos de un día. El lienzo mide esto, siempre. */
export const DAY_MINUTES = 1440;

/** Unidad mínima de la grilla. Es lo que se puede elegir al hacer click. */
export const SLOT_MINUTES = 15;

/**
 * Alto de un minuto, en píxeles.
 *
 * Uno a uno: la hora mide 60px, la celda de 15 minutos 15px y el día 1440px.
 * Que la cuenta sea la identidad no es capricho: hace que un error de
 * posicionamiento se vea a simple vista al leer el número.
 */
export const PX_PER_MINUTE = 1;

/**
 * Alto mínimo de una cita, en píxeles.
 *
 * Una de 15 minutos mediría 15px y no entraría ni la hora. Se dibuja más alta
 * que su duración real: es preferible una leve imprecisión visual a un bloque
 * ilegible o imposible de tocar.
 */
export const MIN_BLOCK_HEIGHT = 22;

export interface MinuteRange {
	startMinute: number;
	endMinute: number;
}

/**
 * Minutos desde la medianoche **en la zona horaria del negocio**.
 *
 * No se usa `getHours()` sobre el instante porque devolvería la hora del
 * navegador: quien abra el panel desde otro huso vería la agenda corrida.
 * Tampoco se parsea la cadena ya formateada, por lo que documenta
 * `mapAppointment`: una regex sobre texto formateado ya rompió el orden de la
 * agenda una vez, y sin ningún error visible.
 */
export const minutesInTimeZone = (
	iso: string,
	timeZone?: string,
): number | null => {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;

	const parts = new Intl.DateTimeFormat('en-GB', {
		timeZone,
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).formatToParts(date);

	const hour = Number(parts.find((part) => part.type === 'hour')?.value);
	const minute = Number(parts.find((part) => part.type === 'minute')?.value);

	if (!Number.isFinite(hour) || !Number.isFinite(minute)) return null;

	// `en-GB` devuelve 24 para la medianoche en algunos entornos.
	return (hour % 24) * 60 + minute;
};

/** `15:30` a partir de los minutos desde medianoche. */
export const formatMinute = (minute: number): string => {
	const hours = Math.floor(minute / 60) % 24;
	const minutes = Math.floor(minute % 60);
	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

/** `YYYY-MM-DD` del instante **en la zona del negocio**. */
export const dateKeyInTimeZone = (
	iso: string,
	timeZone?: string,
): string | null => {
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return null;

	// `en-CA` ya formatea como `YYYY-MM-DD`.
	return new Intl.DateTimeFormat('en-CA', {
		timeZone,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	}).format(date);
};

/**
 * Qué día es hoy para el negocio.
 *
 * No alcanza con la fecha del navegador: a las 21:00 del lunes en Bolivia ya es
 * martes en Europa, y el botón "Hoy" tiene que llevar al día del local.
 */
export const todayKeyInTimeZone = (
	timeZone?: string,
	now: Date = new Date(),
): string => dateKeyInTimeZone(now.toISOString(), timeZone) ?? '';

/** Minuto del día en que estamos, o `null` si el instante no es válido. */
export const nowMinuteInTimeZone = (
	now: Date,
	timeZone?: string,
): number | null => minutesInTimeZone(now.toISOString(), timeZone);

/** Corre una fecha `YYYY-MM-DD` una cantidad de días, sin pasar por zona horaria. */
export const shiftDateKey = (key: string, days: number): string => {
	const [year, month, day] = key.split('-').map(Number);
	const shifted = new Date(Date.UTC(year, month - 1, day + days));

	const pad = (value: number) => String(value).padStart(2, '0');
	return [
		shifted.getUTCFullYear(),
		pad(shifted.getUTCMonth() + 1),
		pad(shifted.getUTCDate()),
	].join('-');
};

/**
 * Los siete días de la semana que contiene esa fecha, de lunes a domingo.
 *
 * La semana arranca el lunes igual que en Configuración y en el calendario
 * mensual. `getUTCDay()` cuenta desde el domingo, así que hay que correr el
 * índice.
 */
export const weekDaysOf = (key: string): string[] => {
	const [year, month, day] = key.split('-').map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	const mondayOffset = (date.getUTCDay() + 6) % 7;
	const monday = shiftDateKey(key, -mondayOffset);

	return Array.from({ length: 7 }, (_, index) => shiftDateKey(monday, index));
};

/**
 * Los minutos que ocupa una cita **dentro del día en que empieza**.
 *
 * El fin se recorta a medianoche: una cita de 23:30 a 00:30 se dibuja hasta el
 * final de su día en lugar de desbordar el lienzo o, peor, devolver un fin menor
 * que el inicio y quedar con alto negativo.
 */
export const dayMinutesOf = (input: {
	startTime: string;
	endTime?: string;
	duration?: number;
	timezone?: string;
}): MinuteRange | null => {
	const startMinute = minutesInTimeZone(input.startTime, input.timezone);
	if (startMinute === null) return null;

	const endsSameDay =
		!!input.endTime &&
		dateKeyInTimeZone(input.endTime, input.timezone) ===
			dateKeyInTimeZone(input.startTime, input.timezone);

	const endFromIso =
		input.endTime && endsSameDay
			? minutesInTimeZone(input.endTime, input.timezone)
			: null;

	// El fin real gana. `duration` es el respaldo, y su propio respaldo es media
	// hora: una cita sin duración conocida tiene que verse igual.
	const fallbackDuration =
		input.duration && input.duration > 0 ? input.duration : 30;

	const endMinute =
		endFromIso !== null && endFromIso > startMinute
			? endFromIso
			: startMinute + fallbackDuration;

	return { startMinute, endMinute: Math.min(endMinute, DAY_MINUTES) };
};

export interface PositionedBlock<T> {
	block: T;
	/** Carril que ocupa dentro de su racimo, empezando en 0. */
	lane: number;
	/** Cuántos carriles tiene el racimo: define el ancho del bloque. */
	laneCount: number;
}

/**
 * Reparte en carriles los bloques que se pisan dentro de una columna.
 *
 * El reparto es por racimo y no global: si de 9 a 10 hay tres citas y de 17 a 18
 * hay una sola, la de la tarde ocupa todo el ancho en vez de quedar angosta por
 * lo que pasó a la mañana. Un racimo es un grupo encadenado por solapamiento,
 * aunque los extremos no se toquen entre sí.
 *
 * Sirve igual para una columna de día en la vista semanal y para una columna de
 * profesional en la diaria: lo único que le importa es que los bloques compartan
 * espacio horizontal.
 */
export const buildColumnLayout = <T extends MinuteRange>(
	blocks: T[],
): Array<PositionedBlock<T>> => {
	const sorted = [...blocks].sort(
		(a, b) => a.startMinute - b.startMinute || a.endMinute - b.endMinute,
	);

	const positioned: Array<PositionedBlock<T>> = [];

	let cluster: T[] = [];
	let clusterEnd = -Infinity;

	const flush = () => {
		if (cluster.length === 0) return;

		// Primer carril libre para cada bloque, en orden de inicio. Es el reparto
		// mínimo que garantiza que dos citas simultáneas nunca compartan carril.
		const laneEnds: number[] = [];
		const lanes = cluster.map((block) => {
			const free = laneEnds.findIndex((end) => end <= block.startMinute);
			const assigned = free === -1 ? laneEnds.length : free;
			laneEnds[assigned] = block.endMinute;
			return assigned;
		});

		const laneCount = laneEnds.length;

		cluster.forEach((block, index) => {
			positioned.push({ block, lane: lanes[index], laneCount });
		});

		cluster = [];
		clusterEnd = -Infinity;
	};

	for (const block of sorted) {
		if (block.startMinute >= clusterEnd) flush();

		cluster.push(block);
		clusterEnd = Math.max(clusterEnd, block.endMinute);
	}

	flush();

	return positioned;
};

/** Dónde y cuánto mide un bloque, en píxeles. */
export const blockGeometry = (
	range: MinuteRange,
): { top: number; height: number } => ({
	top: range.startMinute * PX_PER_MINUTE,
	height: Math.max(
		(range.endMinute - range.startMinute) * PX_PER_MINUTE,
		MIN_BLOCK_HEIGHT,
	),
});

/**
 * Normaliza las franjas de atención: recorta al día, descarta las vacías, ordena
 * y fusiona las que se tocan.
 *
 * Hace falta porque el horario puede venir con dos franjas contiguas —09:00 a
 * 13:00 y 13:00 a 19:00— y dibujarlas por separado pintaría un cierre a las
 * 13:00 donde el negocio no cierra.
 */
export const normalizeOpenRanges = (ranges: MinuteRange[]): MinuteRange[] => {
	const clamped = ranges
		.map((range) => ({
			startMinute: Math.max(0, Math.min(range.startMinute, DAY_MINUTES)),
			endMinute: Math.max(0, Math.min(range.endMinute, DAY_MINUTES)),
		}))
		.filter((range) => range.endMinute > range.startMinute)
		.sort((a, b) => a.startMinute - b.startMinute);

	const merged: MinuteRange[] = [];
	for (const range of clamped) {
		const last = merged[merged.length - 1];

		if (last && range.startMinute <= last.endMinute) {
			last.endMinute = Math.max(last.endMinute, range.endMinute);
			continue;
		}

		merged.push({ ...range });
	}

	return merged;
};

/**
 * El complemento de las franjas de atención: lo que se dibuja como cerrado.
 *
 * Un día sin horario devuelve el día entero cerrado, que es lo correcto: un
 * domingo cerrado tiene que verse cerrado, no vacío.
 */
export const closedRangesOf = (openRanges: MinuteRange[]): MinuteRange[] => {
	const open = normalizeOpenRanges(openRanges);
	const closed: MinuteRange[] = [];

	let cursor = 0;
	for (const range of open) {
		if (range.startMinute > cursor) {
			closed.push({ startMinute: cursor, endMinute: range.startMinute });
		}
		cursor = Math.max(cursor, range.endMinute);
	}

	if (cursor < DAY_MINUTES) {
		closed.push({ startMinute: cursor, endMinute: DAY_MINUTES });
	}

	return closed;
};

/** Si ese minuto cae dentro de alguna franja de atención. */
export const isMinuteOpen = (
	minute: number,
	openRanges: MinuteRange[],
): boolean =>
	normalizeOpenRanges(openRanges).some(
		(range) => minute >= range.startMinute && minute < range.endMinute,
	);

/**
 * A qué celda de 15 minutos corresponde una posición vertical.
 *
 * Redondea hacia abajo: al hacer click a las 09:12 la cita que se propone
 * empieza a las 09:00, no a las 09:15. Fuera del lienzo devuelve `null` en lugar
 * de acomodar el valor, porque un click fuera de la grilla no es una hora.
 */
export const slotMinuteAt = (offsetPx: number): number | null => {
	const minute = Math.floor(offsetPx / PX_PER_MINUTE);
	if (minute < 0 || minute >= DAY_MINUTES) return null;

	return Math.floor(minute / SLOT_MINUTES) * SLOT_MINUTES;
};

/** Las horas en punto del lienzo: 00:00 … 23:00. */
export const HOUR_MARKS: number[] = Array.from(
	{ length: 24 },
	(_, hour) => hour * 60,
);
