import type { Appointment } from '@/types/appointments.types';
import {
	dateKeyInTimeZone,
	dayMinutesOf,
	type MinuteRange,
} from './calendarLayout';

/**
 * De citas a bloques dibujables, agrupados por columna.
 *
 * Es puro y está separado del componente porque acá se decide **a qué día
 * pertenece cada cita**, y eso no se puede mirar en la pantalla: una cita en el
 * día equivocado se ve igual de bien que una en el correcto.
 */

export interface AppointmentBlock extends MinuteRange {
	/**
	 * Identifica al bloque, no a la cita: en la vista por profesional una misma
	 * cita puede aportar dos tramos, uno en cada columna.
	 */
	key: string;
	appointment: Appointment;
}

/**
 * Reparte las citas por día del calendario.
 *
 * El día lo decide la zona del negocio y no la del navegador: una cita de las
 * 22:00 en Bolivia pertenece a ese día aunque en UTC ya sea el siguiente.
 *
 * Una cita sin instante legible se saltea en lugar de dibujarse a la medianoche,
 * que sería información falsa en un lugar creíble.
 */
export const groupBlocksByDay = (
	appointments: Appointment[],
	timezone?: string,
): Map<string, AppointmentBlock[]> => {
	const grouped = new Map<string, AppointmentBlock[]>();

	for (const appointment of appointments) {
		const zone = timezone ?? appointment.timezone;
		const day = dateKeyInTimeZone(appointment.startTime, zone);
		const minutes = dayMinutesOf({ ...appointment, timezone: zone });

		if (!day || !minutes) continue;

		const blocks = grouped.get(day) ?? [];
		blocks.push({ key: appointment.id, appointment, ...minutes });
		grouped.set(day, blocks);
	}

	return grouped;
};
