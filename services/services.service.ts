import { axiosInstance } from '@/lib/axios';
import type { Service, CreateServiceDto, UpdateServiceDto } from '@/types/services.types';

class ServicesService {
	async getAll(): Promise<Service[]> {
		const response = await axiosInstance.get('/services');
		return response.data;
	}

	async getById(id: string): Promise<Service> {
		const response = await axiosInstance.get(`/services/${id}`);
		return response.data;
	}

	async create(serviceData: CreateServiceDto): Promise<Service> {
		const response = await axiosInstance.post('/services', serviceData);
		return response.data;
	}

	async update(id: string, serviceData: UpdateServiceDto): Promise<Service> {
		const response = await axiosInstance.patch(`/services/${id}`, serviceData);
		return response.data;
	}

	async delete(id: string): Promise<void> {
		await axiosInstance.delete(`/services/${id}`);
	}
}

export const servicesService = new ServicesService();
export type { Service, CreateServiceDto, UpdateServiceDto };
