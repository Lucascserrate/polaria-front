import { axiosInstance } from '@/lib/axios';
import type {
	ServiceCategory,
	CreateServiceCategoryDto,
	UpdateServiceCategoryDto,
	MoveDirection,
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

/**
 * Mueve una categoría un lugar y devuelve la lista ya reordenada.
 *
 * El servidor contesta con todas porque un movimiento las renumera a todas. Eso
 * deja escribir la respuesta en la caché tal cual, sin recalcular nada acá ni
 * pedir la lista de nuevo.
 */
export const moveServiceCategory = async (
	id: string,
	direction: MoveDirection,
): Promise<ServiceCategory[]> => {
	const response = await axiosInstance.patch<ServiceCategory[]>(
		`/service-categories/${id}/move`,
		{ direction },
	);
	return response.data;
};

export const deleteServiceCategory = async (id: string): Promise<void> => {
	await axiosInstance.delete(`/service-categories/${id}`);
};
