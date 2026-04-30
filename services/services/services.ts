import { axiosInstance } from '@/lib/axios';
import type { ServiceApi } from '@/types/appointments.types';

export const getServices = async (): Promise<ServiceApi[]> => {
	const { data } = await axiosInstance.get('/services');
	return data;
};
