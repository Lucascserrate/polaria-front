import { axiosInstance } from '@/lib/axios';
import { toPrice } from '@/lib/money';
import type {
	Service,
	CreateServiceDto,
	UpdateServiceDto,
} from '@/types/services.types';

/**
 * Normaliza el precio a número, o a `null` si no hay.
 *
 * La columna es `decimal(10,2)`, y MySQL devuelve los decimales como **string**
 * aunque la entidad los declare `number`. Sumar sobre eso no falla: concatena.
 * Un total de 100 se veía como `0100.00`, porque `0 + '100.00'` es una cadena.
 *
 * Se arregla en el borde y no en cada pantalla: así el tipo `Service` dice la
 * verdad y quien lo consume puede sumar sin desconfiar. Con `Number` a secas, el
 * servicio que se cotiza —que llega sin precio— entraba al panel valiendo cero,
 * o sea gratis.
 */
const toService = (service: Service): Service => ({
	...service,
	price: toPrice(service.price),
});

export const getServices = async (): Promise<Service[]> => {
	const response = await axiosInstance.get<Service[]>('/services');
	return response.data.map(toService);
};

export const getService = async (id: string): Promise<Service> => {
	const response = await axiosInstance.get<Service>(`/services/${id}`);
	return toService(response.data);
};

export const createService = async (
	serviceData: CreateServiceDto,
): Promise<Service> => {
	const response = await axiosInstance.post<Service>('/services', serviceData);
	return response.data;
};

export const updateService = async (
	id: string,
	serviceData: UpdateServiceDto,
): Promise<Service> => {
	const response = await axiosInstance.patch<Service>(
		`/services/${id}`,
		serviceData,
	);
	return response.data;
};

export const deleteService = async (id: string): Promise<void> => {
	await axiosInstance.delete(`/services/${id}`);
};
export type { Service, CreateServiceDto, UpdateServiceDto };
