import { axiosInstance } from '@/lib/axios';
import type { Service } from '@/types/service.types';

class ServicesService {
	async getAll(): Promise<Service[]> {
		const response = await axiosInstance.get('/services');
		return response.data;
	}
}

export const servicesService = new ServicesService();
export type { Service };

