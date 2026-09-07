import { axiosInstance } from '@/lib/axios';

/**
 * Las fotos del local: `GET/POST/PATCH/DELETE /settings/photos`.
 *
 * Vive aparte de `settings.service.ts` porque es una colección con
 * operaciones propias, y no un campo más del formulario de configuración. Eso
 * además deja invalidar solo la galería cuando cambia una foto, sin volver a
 * pedir la conexión con Meta ni el estado de facturación.
 */
export const BUSINESS_PHOTOS_KEY = ['settings', 'photos'] as const;

export type BusinessPhoto = {
	id: string;
	url: string;
	/**
	 * Medidas del archivo guardado. Las manda el backend para que la miniatura
	 * reserve su espacio antes de que la imagen cargue.
	 */
	width: number;
	height: number;
};

export type BusinessGallery = {
	/** En orden. La primera es la portada: la que se ve grande en la página. */
	photos: BusinessPhoto[];
	/**
	 * Cuántas fotos admite un negocio.
	 *
	 * Viene del backend y no está escrito acá a propósito, igual que el largo
	 * del mensaje de bienvenida: una copia del límite en el navegador se
	 * desactualizaría sola y terminaría deshabilitando el botón en un número que
	 * el servidor ya no aplica.
	 */
	maxPhotos: number;
};

export const getBusinessPhotos = async (): Promise<BusinessGallery> => {
	const { data } = await axiosInstance.get<BusinessGallery>('/settings/photos');
	return data;
};

/**
 * Sube varias fotos en una sola petición.
 *
 * `FormData` sin `Content-Type` a mano: el navegador tiene que poner el suyo,
 * que incluye el `boundary` con el que se separan los archivos. Escribirlo
 * nosotros lo deja sin `boundary` y el backend recibe un cuerpo que no puede
 * partir.
 */
export const uploadBusinessPhotos = async (
	files: File[],
): Promise<BusinessGallery> => {
	const form = new FormData();
	files.forEach((file) => form.append('files', file));

	const { data } = await axiosInstance.post<BusinessGallery>(
		'/settings/photos',
		form,
	);

	return data;
};

export const deleteBusinessPhoto = async (
	photoId: string,
): Promise<BusinessGallery> => {
	const { data } = await axiosInstance.delete<BusinessGallery>(
		`/settings/photos/${photoId}`,
	);

	return data;
};

export const setBusinessPhotoCover = async (
	photoId: string,
): Promise<BusinessGallery> => {
	const { data } = await axiosInstance.patch<BusinessGallery>(
		`/settings/photos/${photoId}/cover`,
	);

	return data;
};
