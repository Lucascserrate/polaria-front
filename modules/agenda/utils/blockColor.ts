import {
	colorOf,
	schemeOf,
	type TeamColorScheme,
} from '@/modules/team/utils/colors';

/** Lo mínimo de un tramo para saber de quién es y de qué color. */
export interface ColoredSegment {
	staffId: string | null;
	staffColor?: string | null;
}

/**
 * De quién es un bloque del calendario, si es de una sola persona.
 *
 * Dos casos y una negativa. En la vista por profesional el bloque **ya** viene con
 * su `staffId`, porque cada tramo se dibuja en la columna de quien lo hace. En la
 * semanal el bloque es la cita entera y hay que mirar sus tramos: si son todos de
 * la misma persona, es de ella.
 *
 * Y si son de dos, no es de ninguno. Pintar una cita compartida con el color de
 * uno de los dos sería atribuírsela, y el color existe justamente para responder
 * "de quién es esto" —una respuesta equivocada es peor que ninguna—.
 *
 * Un tramo sin profesional tampoco cuenta: lo que quedó sin asignar no tiene
 * color.
 */
export const soleStaffOf = (
	segments: ColoredSegment[],
	blockStaffId?: string | null,
): ColoredSegment | null => {
	if (blockStaffId) {
		return segments.find((segment) => segment.staffId === blockStaffId) ?? null;
	}

	const assigned = segments.filter((segment) => segment.staffId);
	if (assigned.length === 0) return null;

	const first = assigned[0];
	const shared = assigned.some((segment) => segment.staffId !== first.staffId);

	return shared ? null : first;
};

/**
 * El color con el que se dibuja un bloque, o `null` si no le corresponde ninguno.
 *
 * `null` significa "usá el tratamiento neutro por estado", y ocurre en tres casos
 * que llegan al mismo lugar: la cita es compartida, no tiene profesional, o es un
 * dato viejo sin tramos.
 *
 * Cuando sí hay persona, el color sale de `colorOf`: el que eligió, o el derivado
 * de su id. Así un equipo que nunca configuró colores igual se distingue en la
 * agenda, que es donde el color hace falta.
 */
export const blockSchemeOf = (
	segments: ColoredSegment[],
	blockStaffId?: string | null,
): TeamColorScheme | null => {
	const staff = soleStaffOf(segments, blockStaffId);
	if (!staff?.staffId) return null;

	return schemeOf(
		colorOf({ id: staff.staffId, calendarColor: staff.staffColor }),
	);
};
