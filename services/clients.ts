import { axiosInstance } from '@/lib/axios';
import type { ClientApi } from '@/types/appointments.types';

export const getClients = async (): Promise<ClientApi[]> => {
	const { data } = await axiosInstance.get('/clients');
	return data;
};

export const findOrCreateClient = async (input: {
	name: string;
	phone?: string;
}): Promise<ClientApi> => {
	const { data } = await axiosInstance.post('/clients/find-or-create', input);
	return data;
};
