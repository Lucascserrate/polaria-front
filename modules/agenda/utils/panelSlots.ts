import {
	DAY_MINUTES,
	normalizeOpenRanges,
	SLOT_MINUTES,
	type MinuteRange,
} from './calendarLayout';

/**
 * Qué horarios ofrece el panel para registrar algo que ya pasó.
 *
 * Es la única situación en la que el motor de disponibilidad no sirve: ese motor
 * genera candidatos **dentro de la jornada** y desde ahora en adelante, porque
 * responde "qué le puedo ofrecer a un cliente". Cargar la atención de las 20:30
 * de un martes que el local cerró a las 19:00 es trabajo legítimo del dueño, y
 * para eso hace falta el día completo.
 *
 * Ofrecer no es esconder: los horarios que estaban ocupados o fuera del horario
 * se ofrecen igual, marcados. En un registro histórico el dueño necesita saber
 * por qué un horario es raro, no que desaparezca.
 */

export interface PanelSlotOption {
	/** Minuto del día en que arranca. */
	minute: number;
	/** Ese profesional ya tenía algo ahí. */
	busy: boolean;
	/** El negocio no atendía a esa hora. */
	outsideHours: boolean;
}

const overlaps = (a: MinuteRange, b: MinuteRange): boolean =>
	a.startMinute < b.endMinute && b.startMinute < a.endMinute;

const isInside = (range: MinuteRange, ranges: MinuteRange[]): boolean =>
	ranges.some(
		(open) =>
			range.startMinute >= open.startMinute && range.endMinute <= open.endMinute,
	);

/**
 * El día completo en tramos de 15 minutos.
 *
 * Solo se ofrecen los que **entran**: una reserva de una hora no puede empezar a
 * las 23:30, porque terminaría al día siguiente y la agenda la dibujaría
 * recortada.
 */
export const buildHistoricalSlots = (input: {
	/** Duración total de la reserva, encadenando todos sus servicios. */
	durationMinutes: number;
	/** Lo que los profesionales elegidos ya tenían ese día. */
	busyRanges?: MinuteRange[];
	/** Franjas de atención del negocio ese día. */
	openRanges?: MinuteRange[];
}): PanelSlotOption[] => {
	const duration = Math.max(input.durationMinutes, SLOT_MINUTES);
	const busy = input.busyRanges ?? [];
	const open = normalizeOpenRanges(input.openRanges ?? []);

	const options: PanelSlotOption[] = [];

	for (let minute = 0; minute + duration <= DAY_MINUTES; minute += SLOT_MINUTES) {
		const range = { startMinute: minute, endMinute: minute + duration };

		options.push({
			minute,
			busy: busy.some((taken) => overlaps(range, taken)),
			outsideHours: !isInside(range, open),
		});
	}

	return options;
};
