import { axiosInstance } from '@/lib/axios';
import type {
	AppointmentApi,
	AppointmentApiPage,
	AppointmentStatus,
	AppointmentApiToday,
	AppointmentApiRange,
	AppointmentDetailApi,
} from '@/types/appointments.types';

export const getAppointments = async (
	page = 1,
	limit = 20,
	filters?: {
		search?: string;
		status?: string;
		sortBy?: 'date-asc' | 'date-desc';
	},
): Promise<AppointmentApiPage> => {
	const { data } = await axiosInstance.get('/appointments', {
		params: { 
			page, 
			limit,
			...(filters?.search && { search: filters.search }),
			...(filters?.status && { status: filters.status }),
			...(filters?.sortBy && { sortBy: filters.sortBy }),
		},
	});
	return data;
};

export const updateAppointmentStatus = async (
	id: string,
	status: AppointmentStatus,
): Promise<AppointmentApi> => {
	const { data } = await axiosInstance.patch(`/appointments/${id}`, { status });
	return data;
};

export const createAppointment = async (input: {
	clientId: string;
	staffId: string;
	serviceIds: string[];
	startTime: string;
	endTime: string;
	tenantId?: string;
}): Promise<AppointmentApi> => {
	const { data } = await axiosInstance.post('/appointments', input);
	return data;
};

/** Sin `date` devuelve hoy en la zona horaria del negocio. */
export const getDayAppointments = async (
	date?: string,
): Promise<AppointmentApiToday> => {
	const { data } = await axiosInstance.get('/appointments/day', {
		params: date ? { date } : undefined,
	});
	return data;
};

/**
 * Las citas de varios días, para la agenda semanal.
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

export const deleteAppointment = async (id: string) => {
	await axiosInstance.delete(`/appointments/${id}`);
};
