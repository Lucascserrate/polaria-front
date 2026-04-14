import { axiosInstance } from '@/lib/axios';
import type {
	AppointmentApi,
	AppointmentApiPage,
	AppointmentStatus,
	AppointmentApiToday,
} from '@/types/appointments.types';

export const getAppointments = async (
	page = 1,
	limit = 20,
): Promise<AppointmentApiPage> => {
	const { data } = await axiosInstance.get('/appointments', {
		params: { page, limit },
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

export const getTodayAppointments = async (): Promise<AppointmentApiToday> => {
	const { data } = await axiosInstance.get('/appointments/today');
	return data;
};

export const deleteAppointment = async (id: string) => {
	await axiosInstance.delete(`/appointments/${id}`);
};
