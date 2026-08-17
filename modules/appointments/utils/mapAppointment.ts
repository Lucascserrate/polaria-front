import type { Appointment, AppointmentApi } from '@/types/appointments.types';

/**
 * Traduce una cita de la API a lo que consume la interfaz.
 *
 * El orden sale de `startTime`, el instante ISO que devuelve el backend, y no de
 * `startTimeFormatted`. Antes se deducía la hora partiendo la cadena formateada
 * con una expresión regular: si alguien cambiaba el locale del backend, la regex
 * dejaba de coincidir, todas las citas quedaban con clave `0` y la agenda se
 * mostraba desordenada **sin ningún error visible**.
 */
export const mapAppointment = (apt: AppointmentApi): Appointment => ({
	id: apt.id,
	clientName: apt.clientName ?? 'Sin cliente',
	timeLabel: apt.startTimeFormatted ?? 'Sin hora',
	sortKey: toSortKey(apt.startTime),
	service: (apt.serviceNames ?? []).join(', ') || 'Sin servicio',
	barber: apt.staffName ?? 'Sin barbero',
	status: apt.status,
	duration: Number.isFinite(apt.totalDuration) ? Number(apt.totalDuration) : 0,
});

/**
 * Milisegundos del instante, o `0` si falta o no es una fecha válida.
 *
 * El `0` manda las citas sin hora al principio de la lista, que es preferible a
 * esconderlas: si algo viene mal, que se vea.
 */
const toSortKey = (startTime?: string | null): number => {
	if (!startTime) return 0;

	const parsed = new Date(startTime).getTime();
	return Number.isFinite(parsed) ? parsed : 0;
};
