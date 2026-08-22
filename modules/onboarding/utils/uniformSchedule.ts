import {
	DEFAULT_RANGE,
	WEEK_DAYS,
	type DayRange,
	type ScheduleDraft,
} from '@/modules/schedule/utils/weeklySchedule';

/**
 * Ayudas para editar la jornada en el modo simple del onboarding.
 *
 * La mayoría de los negocios abre el mismo horario todos los días que abre, así
 * que la pantalla pide un solo rango y lo aplica a los días marcados. El editor
 * por día sigue existiendo detrás de un desplegable para lo demás: turno
 * partido, sábado corto, cada día distinto.
 *
 * Todo acá es puro y opera sobre el mismo `ScheduleDraft` que usa Configuración,
 * así que las dos vistas editan exactamente la misma estructura.
 */

export const isDayOpen = (draft: ScheduleDraft, dayOfWeek: number): boolean =>
	(draft[dayOfWeek] ?? []).length > 0;

export const openDaysCount = (draft: ScheduleDraft): number =>
	WEEK_DAYS.filter(({ dayOfWeek }) => isDayOpen(draft, dayOfWeek)).length;

/**
 * El rango común a todos los días abiertos, o `null` si no hay uno.
 *
 * Devuelve `null` en dos casos que la pantalla simple no puede representar: que
 * algún día tenga más de una franja, o que los días abiertos no coincidan entre
 * sí. Ahí es cuando corresponde mostrar el editor por día en lugar de mentir con
 * un valor que no describe la jornada.
 */
export const uniformRange = (draft: ScheduleDraft): DayRange | null => {
	const open = WEEK_DAYS.map(({ dayOfWeek }) => draft[dayOfWeek] ?? []).filter(
		(ranges) => ranges.length > 0,
	);

	if (open.length === 0) return null;
	if (open.some((ranges) => ranges.length > 1)) return null;

	const [first] = open[0];
	const allEqual = open.every(
		([range]) =>
			range.startTime === first.startTime && range.endTime === first.endTime,
	);

	return allEqual ? { ...first } : null;
};

/** Abre o cierra un día, dándole el rango que ya comparten los demás. */
export const toggleDay = (
	draft: ScheduleDraft,
	dayOfWeek: number,
): ScheduleDraft => {
	if (isDayOpen(draft, dayOfWeek)) {
		return { ...draft, [dayOfWeek]: [] };
	}

	// Al abrir un día se le da el horario de los que ya están abiertos; si no hay
	// ninguno o difieren, el valor por defecto.
	const range = uniformRange(draft) ?? DEFAULT_RANGE;
	return { ...draft, [dayOfWeek]: [{ ...range }] };
};

/**
 * Aplica un mismo rango a todos los días abiertos.
 *
 * Pisa las franjas existentes a propósito: es lo que el usuario pide al editar
 * el horario común. Si tenía una jornada por día, la pantalla ya le avisó y le
 * ofreció el editor detallado antes de llegar acá.
 */
export const applyRangeToOpenDays = (
	draft: ScheduleDraft,
	range: DayRange,
): ScheduleDraft => {
	const next: ScheduleDraft = { ...draft };

	for (const { dayOfWeek } of WEEK_DAYS) {
		if (isDayOpen(draft, dayOfWeek)) {
			next[dayOfWeek] = [{ ...range }];
		}
	}

	return next;
};

/** Etiquetas cortas para las pastillas de día. */
export const DAY_PILLS = WEEK_DAYS.map(({ dayOfWeek, label }) => ({
	dayOfWeek,
	short: label.slice(0, 2),
	label,
}));
