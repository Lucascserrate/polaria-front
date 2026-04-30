import { axiosInstance } from '@/lib/axios';
import type { StaffApi } from '@/types/appointments.types';

export const getStaff = async (): Promise<StaffApi[]> => {
	const { data } = await axiosInstance.get('/staff');
	return data;
};
