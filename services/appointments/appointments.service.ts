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
): Promise<CreateBookingResponse> => {
	const { data } = await axiosInstance.post('/appointments', payload);
	return data;
};

export interface CreateBookingPayload {
	clientId: string;
	startTime: string;
	items: Array<{ serviceId: string; staffId: string }>;
}

/** Lo que el panel debe advertir después de crear: pasado, cerrado, fuera de turno. */
export interface BookingWarning {
	code:
		| 'PAST_TIME'
		| 'CLOSED_DAY'
		| 'OUTSIDE_BUSINESS_HOURS'
		| 'STAFF_OFF_SHIFT';
	message: string;
	staffId?: string;
}

export interface CreateBookingResponse {
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
): Promise<AppointmentDetailApi> => {
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
