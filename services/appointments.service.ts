import { axiosInstance } from '@/lib/axios';
import type {
	AppointmentApi,
	AppointmentApiPage,
	AppointmentStatus,
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

export const deleteAppointment = async (id: string)=> {
	await axiosInstance.delete(`/appointments/${id}`);
};
