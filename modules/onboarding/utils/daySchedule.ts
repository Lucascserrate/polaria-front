import {
	DEFAULT_RANGE,
	toMinutes,
	WEEK_DAYS,
	type DayRange,
	type ScheduleDraft,
} from '@/modules/schedule/utils/weeklySchedule';

/**
 * Edición de la jornada un día a la vez.
 *
 * Todo puro y sobre el mismo `ScheduleDraft` que usa Configuración: son dos
 * vistas de la misma estructura, no dos modelos.
 */

/** Etiquetas cortas para las pastillas de día. */
export const DAY_PILLS = WEEK_DAYS.map(({ dayOfWeek, label }) => ({
	dayOfWeek,
	short: label.slice(0, 2),
	label,
}));

export const dayRanges = (
	draft: ScheduleDraft,
	dayOfWeek: number,
): DayRange[] => draft[dayOfWeek] ?? [];

export const isDayOpen = (draft: ScheduleDraft, dayOfWeek: number): boolean =>
	dayRanges(draft, dayOfWeek).length > 0;

export const openDaysCount = (draft: ScheduleDraft): number =>
	WEEK_DAYS.filter(({ dayOfWeek }) => isDayOpen(draft, dayOfWeek)).length;

const toTime = (minutes: number): string => {
	const clamped = Math.max(0, Math.min(23 * 60 + 59, minutes));
	const hours = Math.floor(clamped / 60);
	return `${String(hours).padStart(2, '0')}:${String(clamped % 60).padStart(2, '0')}`;
};

/** El horario de algún día ya abierto, para no arrancar de cero cada vez. */
const inheritedRange = (draft: ScheduleDraft): DayRange => {
	for (const { dayOfWeek } of WEEK_DAYS) {
		const [first] = dayRanges(draft, dayOfWeek);
		if (first) return { ...first };
	}
	return { ...DEFAULT_RANGE };
};

/**
 * Abre o cierra un día.
 *
 * Cerrar vacía las franjas, que es lo que el backend entiende por "cerrado": un
 * día sin filas en `business_hours`. Al abrirlo hereda el horario de otro día
 * abierto, así que marcar el sábado después de cargar la semana no obliga a
 * reescribir la hora.
 */
export const setDayOpen = (
	draft: ScheduleDraft,
	dayOfWeek: number,
	open: boolean,
): ScheduleDraft => ({
	...draft,
	[dayOfWeek]: open ? [inheritedRange(draft)] : [],
});

export const updateRange = (
	draft: ScheduleDraft,
	dayOfWeek: number,
	index: number,
	patch: Partial<DayRange>,
): ScheduleDraft => ({
	...draft,
	[dayOfWeek]: dayRanges(draft, dayOfWeek).map((range, position) =>
		position === index ? { ...range, ...patch } : range,
	),
});

/**
 * Agrega una franja después de la última.
 *
 * Arranca donde terminó la anterior y dura una hora. No es el turno partido que
 * el negocio quiere, pero es válido —no se superpone— y deja las dos horas a un
 * toque de distancia. Proponer un hueco inventado sería adivinar cuándo almuerza.
 */
export const addRange = (
	draft: ScheduleDraft,
	dayOfWeek: number,
): ScheduleDraft => {
	const ranges = dayRanges(draft, dayOfWeek);
	const last = ranges[ranges.length - 1];
	const start = last ? toMinutes(last.endTime) : toMinutes(DEFAULT_RANGE.startTime);

	return {
		...draft,
		[dayOfWeek]: [
			...ranges,
			{ startTime: toTime(start), endTime: toTime(start + 60) },
		],
	};
};

export const removeRange = (
	draft: ScheduleDraft,
	dayOfWeek: number,
	index: number,
): ScheduleDraft => ({
	...draft,
	[dayOfWeek]: dayRanges(draft, dayOfWeek).filter(
		(_, position) => position !== index,
	),
});
