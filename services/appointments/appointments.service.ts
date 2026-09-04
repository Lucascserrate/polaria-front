import { axiosInstance } from '@/lib/axios';
import type {
	AppointmentApi,
	AppointmentApiRange,
	AppointmentDetailApi,
	AppointmentStatus,
} from '@/types/appointments.types';

export const updateAppointmentStatus = async (
	id: string,
	status: AppointmentStatus,
): Promise<AppointmentApi> => {
	const { data } = await axiosInstance.patch(`/appointments/${id}`, { status });
	return data;
};

/**
 * Crea una reserva desde el panel.
 *
 * Mismo estado deseado que la edición: cuándo empieza y qué servicios tiene, cada
 * uno con su profesional. El fin lo deriva el backend de las duraciones vigentes,
 * y el estado también —una fecha pasada nace atendida—, así que nada de eso viaja
 * desde acá.
 */
export const createAppointment = async (
	payload: CreateBookingPayload,
): Promise<SaveBookingResponse> => {
	const { data } = await axiosInstance.post('/appointments', payload);
	return data;
};

export interface CreateBookingPayload {
	clientId: string;
	startTime: string;
	items: Array<{ serviceId: string; staffId: string }>;
}

/**
 * Lo que el panel debe advertir después de guardar.
 *
 * Vale igual al crear y al editar: son las dos caras de la misma política —el
 * panel registra lo que el negocio pide y avisa qué tiene de raro— y por eso
 * comparten forma.
 */
export interface BookingWarning {
	code:
		| 'PAST_TIME'
		| 'CLOSED_DAY'
		| 'OUTSIDE_BUSINESS_HOURS'
		| 'STAFF_OFF_SHIFT'
		| 'STAFF_BUSY';
	message: string;
	staffId?: string;
}

export interface SaveBookingResponse {
	appointment: AppointmentDetailApi;
	warnings: BookingWarning[];
}

/**
 * Las citas de varios días, para la agenda.
 *
 * @param from `YYYY-MM-DD` en la zona del negocio.
 * @param to Igual, inclusive: pedir de lunes a domingo trae el domingo entero.
 */
export const getAppointmentsRange = async (
	from: string,
	to: string,
): Promise<AppointmentApiRange> => {
	const { data } = await axiosInstance.get('/appointments/range', {
		params: { from, to },
	});
	return data;
};

/** Lo que devuelve la cola de citas sin cerrar. */
export interface UnresolvedAppointments {
	/** Las más viejas primero, recortadas al `limit` pedido. */
	items: AppointmentApi[];
	/** Cuántas hay en total, que puede ser mucho más que `items.length`. */
	total: number;
	timezone: string;
}

/**
 * Las citas de días ya cerrados que siguen en pendiente o confirmado.
 *
 * @param limit Cuántas traer. El tope real lo pone el servidor.
 */
export const getUnresolvedAppointments = async (
	limit: number,
): Promise<UnresolvedAppointments> => {
	const { data } = await axiosInstance.get('/appointments/unresolved', {
		params: { limit },
	});
	return data;
};

/** La reserva completa: lo que muestra y edita el drawer. */
export const getAppointmentDetail = async (
	id: string,
): Promise<AppointmentDetailApi> => {
	const { data } = await axiosInstance.get(`/appointments/${id}`);
	return data;
};

/** Estado deseado de lo editable: cuándo empieza y qué servicios tiene. */
export interface EditBookingPayload {
	startTime: string;
	items: Array<{ serviceId: string; staffId: string }>;
}

export const editBooking = async (
	id: string,
	payload: EditBookingPayload,
): Promise<SaveBookingResponse> => {
	const { data } = await axiosInstance.patch(
		`/appointments/${id}/booking`,
		payload,
	);
	return data;
};

/**
 * Borra una reserva de verdad.
 *
 * No es cancelar: cancelar la deja en la historia con su horario liberado. Esto
 * es para lo que nunca debió existir —una prueba, una carga duplicada— y no se
 * puede deshacer.
 */
export const deleteAppointment = async (id: string): Promise<void> => {
	await axiosInstance.delete(`/appointments/${id}`);
};
