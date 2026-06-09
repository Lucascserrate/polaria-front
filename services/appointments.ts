import { axiosInstance } from '@/lib/axios';
import type {
	AppointmentApi,
	AppointmentApiPage,
	AppointmentStatus,
	AppointmentApiToday,
} from '@/types/appointments.types';

export type AppointmentDetailApi = AppointmentApi & {
	startTime?: string;
	endTime?: string;
};

export type UpdateAppointmentInput = {
	startTime?: string;
	endTime?: string;
	status?: AppointmentStatus;
};

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

export const getAppointment = async (
	id: string,
): Promise<AppointmentDetailApi> => {
	const { data } = await axiosInstance.get(`/appointments/${id}`);
	return data;
};

export const updateAppointment = async (
	id: string,
	input: UpdateAppointmentInput,
): Promise<AppointmentDetailApi> => {
	const { data } = await axiosInstance.patch(`/appointments/${id}`, input);
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
