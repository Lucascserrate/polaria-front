import type { Appointment } from '@/types/appointments.types';
import { minutesInTimeZone } from './calendarLayout';

/**
 * Cálculos de la agenda diaria: dónde va cada cita en el eje vertical y cómo se
 * reparten las que se pisan.
 *
 * Todo acá es puro y sin React a propósito: es la parte que se rompe en
 * silencio —una cita mal ubicada no lanza ningún error, solo se ve rara— y
 * conviene poder razonarla sin montar un componente.
 */

/** Alto de un minuto. 30 minutos ≈ 42px, que es una card cómoda de leer. */
export const PX_PER_MINUTE = 1.4;

/**
 * Alto mínimo de una card, en píxeles.
 *
 * Una cita de 15 minutos ocuparía 21px y no entraría ni el nombre del cliente.
 * Se dibuja más alta que su duración real: es preferible una leve imprecisión
 * visual a una card ilegible o imposible de tocar.
 */
export const MIN_CARD_HEIGHT = 38;

/** Si no hay horario del negocio ni citas, se muestra una jornada razonable. */
const FALLBACK_RANGE = { startMinute: 8 * 60, endMinute: 20 * 60 };

/** Se redondea el rango a horas enteras para que la regla no arranque a las 8:37. */
const HOUR = 60;

export interface DayRange {
	startMinute: number;
	endMinute: number;
}

export interface PositionedAppointment {
	appointment: Appointment;
	/** Píxeles desde el inicio del rango. */
	top: number;
	height: number;
	/** Carril que ocupa dentro de su racimo, empezando en 0. */
	lane: number;
	/** Cuántos carriles tiene el racimo: define el ancho de la card. */
	laneCount: number;
	startMinute: number;
	endMinute: number;
}

/*
 * Estas dos viven en `calendarLayout`, que es la geometría del calendario nuevo.
 * Se reexportan para que la agenda vieja no tenga su propia copia mientras las
 * dos convivan: dos implementaciones de "en qué minuto cae esta cita" es
 * exactamente la clase de duplicado que se desincroniza sin avisar.
 */
export { formatMinute, minutesInTimeZone } from './calendarLayout';

const spanOf = (appointment: Appointment) => {
	const startMinute = minutesInTimeZone(
		appointment.startTime,
		appointment.timezone,
	);
	if (startMinute === null) return null;

	const endFromIso = appointment.endTime
		? minutesInTimeZone(appointment.endTime, appointment.timezone)
		: null;

	// El fin real gana. `duration` es el respaldo, y su propio respaldo es media
	// hora: una cita sin duración conocida tiene que verse igual.
	const endMinute =
		endFromIso !== null && endFromIso > startMinute
			? endFromIso
			: startMinute + (appointment.duration > 0 ? appointment.duration : 30);

	return { startMinute, endMinute };
};

/**
 * Desde y hasta qué hora se dibuja el día.
 *
 * Parte del horario del negocio —así la agenda no muestra ocho horas vacías de
 * madrugada— pero se estira para incluir cualquier cita que caiga afuera: una
 * cita fuera de horario es justamente la que hay que ver.
 */
export const resolveDayRange = (
	appointments: Appointment[],
	businessRanges: Array<{ startMinute: number; endMinute: number }> = [],
): DayRange => {
	const bounds: number[] = [];

	for (const range of businessRanges) {
		bounds.push(range.startMinute, range.endMinute);
	}

	for (const appointment of appointments) {
		const span = spanOf(appointment);
		if (span) bounds.push(span.startMinute, span.endMinute);
	}

	if (bounds.length === 0) return FALLBACK_RANGE;

	const startMinute = Math.floor(Math.min(...bounds) / HOUR) * HOUR;
	const endMinute = Math.ceil(Math.max(...bounds) / HOUR) * HOUR;

	// Un día con una sola cita puntual daría un rango de una hora; se garantiza
	// un mínimo para que la regla no quede raquítica.
	return endMinute - startMinute < 2 * HOUR
		? { startMinute, endMinute: startMinute + 2 * HOUR }
		: { startMinute, endMinute };
};

/**
 * Ubica cada cita y reparte en carriles las que se pisan.
 *
 * El reparto es por racimo y no global: si de 9 a 10 hay tres citas y de 17 a 18
 * hay una sola, la de la tarde ocupa todo el ancho en vez de quedar angosta por
 * lo que pasó a la mañana. Un racimo es un grupo de citas encadenadas por
 * solapamiento, aunque los extremos no se toquen entre sí.
 *
 * Las canceladas ocupan carril igual que el resto: un día con tres de cuatro
 * citas caídas tiene que verse como lo que es, y esconderlas del reparto haría
 * que el hueco pareciera disponible.
 */
export const buildDayLayout = (
	appointments: Appointment[],
	range: DayRange,
): PositionedAppointment[] => {
	const spans = appointments
		.map((appointment) => {
			const span = spanOf(appointment);
			return span ? { appointment, ...span } : null;
		})
		.filter((item): item is NonNullable<typeof item> => item !== null)
		.sort(
			(a, b) => a.startMinute - b.startMinute || a.endMinute - b.endMinute,
		);

	const positioned: PositionedAppointment[] = [];

	let cluster: typeof spans = [];
	let clusterEnd = -Infinity;

	const flush = () => {
		if (cluster.length === 0) return;

		// Primer carril libre para cada cita, en orden de inicio. Es el reparto
		// mínimo que garantiza que dos citas simultáneas nunca compartan carril.
		const laneEnds: number[] = [];
		const lanes = cluster.map((item) => {
			const lane = laneEnds.findIndex((end) => end <= item.startMinute);
			const assigned = lane === -1 ? laneEnds.length : lane;
			laneEnds[assigned] = item.endMinute;
			return assigned;
		});

		const laneCount = laneEnds.length;

		cluster.forEach((item, index) => {
			const top = (item.startMinute - range.startMinute) * PX_PER_MINUTE;
			const height = Math.max(
				(item.endMinute - item.startMinute) * PX_PER_MINUTE,
				MIN_CARD_HEIGHT,
			);

			positioned.push({
				appointment: item.appointment,
				top,
				height,
				lane: lanes[index],
				laneCount,
				startMinute: item.startMinute,
				endMinute: item.endMinute,
			});
		});

		cluster = [];
		clusterEnd = -Infinity;
	};

	for (const item of spans) {
		if (item.startMinute >= clusterEnd) flush();

		cluster.push(item);
		clusterEnd = Math.max(clusterEnd, item.endMinute);
	}

	flush();

	return positioned;
};

/** Las horas en punto que se dibujan como referencia. */
export const buildHourMarks = (range: DayRange): number[] => {
	const marks: number[] = [];
	for (let minute = range.startMinute; minute <= range.endMinute; minute += HOUR) {
		marks.push(minute);
	}
	return marks;
};

/**
 * Franjas de atención del negocio para un día, en minutos desde medianoche.
 *
 * Traduce lo que ya devuelve `/settings` —una fila por franja, con `dayOfWeek` y
 * horas `HH:MM`— a lo que necesita el rango de la agenda.
 */
export const toBusinessRanges = (
	businessHours: Array<{
		dayOfWeek: number;
		startTime: string;
		endTime: string;
	}> = [],
	dayOfWeek: number,
): Array<{ startMinute: number; endMinute: number }> => {
	const toMinutes = (time: string): number | null => {
		const [hours, minutes] = time.split(':').map(Number);
		if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
		return hours * 60 + minutes;
	};

	return businessHours
		.filter((range) => range.dayOfWeek === dayOfWeek)
		.map((range) => ({
			startMinute: toMinutes(range.startTime),
			endMinute: toMinutes(range.endTime),
		}))
		.filter(
			(range): range is { startMinute: number; endMinute: number } =>
				range.startMinute !== null &&
				range.endMinute !== null &&
				range.endMinute > range.startMinute,
		);
};
