import {
	toScheduleDraft,
	WEEK_DAYS,
	toMinutes,
	type ScheduleDraft,
	type WeeklyRange,
} from '@/modules/schedule/utils/weeklySchedule';

/**
 * Punto de partida al encender la jornada propia: el horario del negocio tal
 * cual. Es lo más parecido a lo que el profesional venía haciendo hasta ese
 * momento, así que en el caso típico solo hay que ajustar un día o una hora.
 *
 * Es una copia directa porque las dos jornadas tienen la misma forma: el
 * horario del negocio ya es un borrador semanal válido.
 */
export const buildDefaultDraft = (businessHours?: WeeklyRange[]): ScheduleDraft =>
	toScheduleDraft(businessHours);

const formatRanges = (ranges: WeeklyRange[]): string =>
	ranges.map((range) => `${range.startTime}–${range.endTime}`).join(', ');

/**
 * Avisos, no errores. Una jornada fuera del horario del negocio se guarda igual
 * —el dueño puede estar por ampliar el horario del local—, pero mientras tanto
 * no produce ni un turno, y eso tiene que verse antes de guardar.
 *
 * La comparación es contra el horario **de ese día**: con el negocio abierto
 * hasta las 18:00 de lunes a viernes y hasta las 14:00 el sábado, una jornada
 * sabatina hasta las 17:00 tiene que avisar aunque entre holgada el resto de la
 * semana.
 *
 * Exige que la franja entre completa en **una sola** franja del negocio, igual
 * que `isWithinWorkingRanges` en el backend: una que abarque dos es una que
 * cruza el hueco del mediodía, y ese tramo no da turnos.
 */
export const findBusinessHoursWarnings = (
	draft: ScheduleDraft,
	businessHours?: WeeklyRange[],
): string[] => {
	if (!businessHours?.length) return [];

	const warnings: string[] = [];

	for (const { dayOfWeek, label } of WEEK_DAYS) {
		const ranges = draft[dayOfWeek] ?? [];
		if (ranges.length === 0) continue;

		const day = label.toLowerCase();
		const businessRanges = businessHours.filter(
			(range) => range.dayOfWeek === dayOfWeek,
		);

		if (businessRanges.length === 0) {
			warnings.push(`El negocio no abre el ${day}: esa jornada no dará turnos.`);
			continue;
		}

		const outside = ranges.some(
			(range) =>
				!businessRanges.some(
					(business) =>
						toMinutes(range.startTime) >= toMinutes(business.startTime) &&
						toMinutes(range.endTime) <= toMinutes(business.endTime),
				),
		);

		if (outside) {
			warnings.push(
				`La jornada del ${day} se sale del horario del negocio (${formatRanges(businessRanges)}) y esa parte no dará turnos.`,
			);
		}
	}

	return warnings;
};
