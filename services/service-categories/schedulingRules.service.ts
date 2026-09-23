import { axiosInstance } from '@/lib/axios';

/**
 * Con qué categorías convive ésta: sólo los ids.
 *
 * Las candidatas no vienen de acá. Son todas las demás del negocio, y esa lista
 * la pantalla ya la tiene para dibujar el catálogo: pedirla de nuevo serían dos
 * copias del mismo dato que pueden llegar distintas.
 */
export const getParallelCategories = async (
	categoryId: string,
): Promise<string[]> => {
	const response = await axiosInstance.get<string[]>(
		`/service-categories/${categoryId}/parallel-with`,
	);
	return response.data;
};

/**
 * Reemplaza la lista completa de categorías que conviven con ésta.
 *
 * Manda el estado entero de la pantalla de casillas y no un cambio: mandar sólo
 * lo marcado dejaría sin forma de expresar "desmarqué todas".
 */
export const setParallelCategories = async (
	categoryId: string,
	categoryIds: string[],
): Promise<string[]> => {
	const response = await axiosInstance.put<string[]>(
		`/service-categories/${categoryId}/parallel-with`,
		{ categoryIds },
	);
	return response.data;
};
