import { axiosInstance } from '@/lib/axios';
import type {
	ServiceCategory,
	CreateServiceCategoryDto,
	UpdateServiceCategoryDto,
} from '@/types/service-categories.types';

export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
	const response = await axiosInstance.get<ServiceCategory[]>(
		'/service-categories',
	);
	return response.data;
};

export const createServiceCategory = async (
	data: CreateServiceCategoryDto,
): Promise<ServiceCategory> => {
	const response = await axiosInstance.post<ServiceCategory>(
		'/service-categories',
		data,
	);
	return response.data;
};

export const updateServiceCategory = async (
	id: string,
	data: UpdateServiceCategoryDto,
): Promise<ServiceCategory> => {
	const response = await axiosInstance.patch<ServiceCategory>(
		`/service-categories/${id}`,
		data,
	);
	return response.data;
};

export const deleteServiceCategory = async (id: string): Promise<void> => {
	await axiosInstance.delete(`/service-categories/${id}`);
};
