/**
 * Edición de una jornada semanal.
 *
 * Es común al horario del negocio y a la jornada propia de un profesional: las
 * dos se guardan igual —una fila por franja, con el día adentro— y por eso se
 * editan con el mismo borrador y el mismo componente.
 */

/** Una franja tal como viaja hacia y desde el backend. */
export interface WeeklyRange {
	/** 0 = domingo, igual que `Date.getDay()`. */
	dayOfWeek: number;
	startTime: string;
	endTime: string;
}

/**
 * Los días en el orden en que los lee el dueño —la semana arranca el lunes—
 * emparejados con el valor que espera el backend, donde 0 es domingo.
 *
 * Llevar la etiqueta junto al valor evita tener que rotar índices entre la API
 * y la pantalla, que es de donde salían los desfases de un día.
 */
export const WEEK_DAYS = [
	{ dayOfWeek: 1, label: 'Lunes' },
	{ dayOfWeek: 2, label: 'Martes' },
	{ dayOfWeek: 3, label: 'Miércoles' },
	{ dayOfWeek: 4, label: 'Jueves' },
	{ dayOfWeek: 5, label: 'Viernes' },
	{ dayOfWeek: 6, label: 'Sábado' },
	{ dayOfWeek: 0, label: 'Domingo' },
] as const;

export interface DayRange {
	startTime: string;
	endTime: string;
}

/** Jornada en edición: las franjas de cada día, indexadas por `dayOfWeek`. */
export type ScheduleDraft = Record<number, DayRange[]>;

export const DEFAULT_RANGE: DayRange = { startTime: '09:00', endTime: '17:00' };

/** El backend devuelve `HH:MM:SS`; `<input type="time">` necesita `HH:MM`. */
export const toTimeInput = (value: string): string => value.slice(0, 5);

export const toMinutes = (time: string): number => {
	const [hours, minutes] = time.split(':').map(Number);
	return hours * 60 + minutes;
};

const byStartTime = (a: DayRange, b: DayRange) =>
	toMinutes(a.startTime) - toMinutes(b.startTime);

export const emptyDraft = (): ScheduleDraft =>
	Object.fromEntries(WEEK_DAYS.map(({ dayOfWeek }) => [dayOfWeek, []]));

export const toScheduleDraft = (ranges?: WeeklyRange[]): ScheduleDraft => {
	const draft = emptyDraft();

	for (const range of ranges ?? []) {
		draft[range.dayOfWeek] ??= [];
		draft[range.dayOfWeek].push({
			startTime: toTimeInput(range.startTime),
			endTime: toTimeInput(range.endTime),
		});
	}

	for (const dayRanges of Object.values(draft)) dayRanges.sort(byStartTime);

	return draft;
};

export const fromScheduleDraft = (draft: ScheduleDraft): WeeklyRange[] =>
	WEEK_DAYS.flatMap(({ dayOfWeek }) =>
		(draft[dayOfWeek] ?? []).map((range) => ({ dayOfWeek, ...range })),
	);

/**
 * Las mismas reglas que valida `assertValidWeeklySchedule` en el backend,
 * repetidas acá para que el error aparezca mientras se edita y no después de
 * guardar. El backend sigue siendo la autoridad.
 *
 * `emptyMessage` lo pone el llamador porque quedarse sin franjas significa
 * cosas distintas según quién edita: un negocio cerrado toda la semana o un
 * profesional que no atiende ningún día.
 */
export const validateScheduleDraft = (
	draft: ScheduleDraft,
	emptyMessage: string,
): string | null => {
	if (fromScheduleDraft(draft).length === 0) return emptyMessage;

	for (const { dayOfWeek, label } of WEEK_DAYS) {
		const ranges = [...(draft[dayOfWeek] ?? [])].sort(byStartTime);
		const day = label.toLowerCase();

		for (const [index, range] of ranges.entries()) {
			if (toMinutes(range.endTime) <= toMinutes(range.startTime)) {
				return `La franja del ${day} termina antes de empezar.`;
			}
			if (
				index > 0 &&
				toMinutes(range.startTime) < toMinutes(ranges[index - 1].endTime)
			) {
				return `Las franjas del ${day} se superponen entre sí.`;
			}
		}
	}

	return null;
};
