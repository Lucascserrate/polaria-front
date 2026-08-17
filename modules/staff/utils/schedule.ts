import type { StaffScheduleApi, StaffScheduleInput } from '@/types/staff.types';

/**
 * Los días en el orden en que los lee el dueño —la semana arranca el lunes—
 * emparejados con el valor que espera el backend, donde 0 es domingo.
 *
 * Llevar la etiqueta junto al valor evita las conversiones de índices que hacen
 * falta en Configuración, donde el array de la API y el de la UI están
 * desfasados y hay que darlos vuelta a mano en las dos direcciones.
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

export interface BusinessHoursSummary {
	workingDays: boolean[];
	openingHours: { from: string; to: string } | null;
}

/** El backend devuelve `HH:MM:SS`; `<input type="time">` necesita `HH:MM`. */
export const toTimeInput = (value: string): string => value.slice(0, 5);

const toMinutes = (time: string): number => {
	const [hours, minutes] = time.split(':').map(Number);
	return hours * 60 + minutes;
};

const byStartTime = (a: DayRange, b: DayRange) =>
	toMinutes(a.startTime) - toMinutes(b.startTime);

const emptyDraft = (): ScheduleDraft =>
	Object.fromEntries(WEEK_DAYS.map(({ dayOfWeek }) => [dayOfWeek, []]));

export const toScheduleDraft = (
	schedules?: StaffScheduleApi[],
): ScheduleDraft => {
	const draft = emptyDraft();

	for (const schedule of schedules ?? []) {
		draft[schedule.dayOfWeek] ??= [];
		draft[schedule.dayOfWeek].push({
			startTime: toTimeInput(schedule.startTime),
			endTime: toTimeInput(schedule.endTime),
		});
	}

	for (const ranges of Object.values(draft)) ranges.sort(byStartTime);

	return draft;
};

export const fromScheduleDraft = (draft: ScheduleDraft): StaffScheduleInput[] =>
	WEEK_DAYS.flatMap(({ dayOfWeek }) =>
		(draft[dayOfWeek] ?? []).map((range) => ({ dayOfWeek, ...range })),
	);

/**
 * Punto de partida al encender la jornada propia: los días y el horario que ya
 * tiene cargados el negocio. Es lo más parecido a lo que el profesional venía
 * haciendo hasta ese momento, así que en el caso típico solo hay que ajustar un
 * día o una hora.
 */
export const buildDefaultDraft = (
	business?: BusinessHoursSummary,
): ScheduleDraft => {
	const draft = emptyDraft();
	const range = business?.openingHours
		? {
				startTime: toTimeInput(business.openingHours.from),
				endTime: toTimeInput(business.openingHours.to),
			}
		: DEFAULT_RANGE;

	for (const { dayOfWeek } of WEEK_DAYS) {
		const opens = business?.workingDays?.[dayOfWeek] ?? dayOfWeek !== 0;
		if (opens) draft[dayOfWeek] = [{ ...range }];
	}

	return draft;
};

/**
 * Las mismas reglas que valida `assertValidStaffSchedules` en el backend,
 * repetidas acá para que el error aparezca mientras se edita y no después de
 * guardar. El backend sigue siendo la autoridad.
 */
export const validateScheduleDraft = (draft: ScheduleDraft): string | null => {
	if (fromScheduleDraft(draft).length === 0) {
		return 'Marca al menos un día de trabajo, o apaga la jornada propia para usar el horario del negocio.';
	}

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

/**
 * Avisos, no errores. Una jornada fuera del horario del negocio se guarda igual
 * —el dueño puede estar por ampliar el horario del local—, pero mientras tanto
 * no produce ni un turno, y eso tiene que verse antes de guardar.
 */
export const findBusinessHoursWarnings = (
	draft: ScheduleDraft,
	business?: BusinessHoursSummary,
): string[] => {
	if (!business?.openingHours) return [];

	const { from, to } = business.openingHours;
	const warnings: string[] = [];

	for (const { dayOfWeek, label } of WEEK_DAYS) {
		const ranges = draft[dayOfWeek] ?? [];
		if (ranges.length === 0) continue;

		const day = label.toLowerCase();

		if (business.workingDays?.[dayOfWeek] === false) {
			warnings.push(`El negocio no abre el ${day}: esa jornada no dará turnos.`);
			continue;
		}

		const outside = ranges.some(
			(range) =>
				toMinutes(range.startTime) < toMinutes(from) ||
				toMinutes(range.endTime) > toMinutes(to),
		);

		if (outside) {
			warnings.push(
				`La jornada del ${day} se sale del horario del negocio (${toTimeInput(from)}–${toTimeInput(to)}) y esa parte no dará turnos.`,
			);
		}
	}

	return warnings;
};
