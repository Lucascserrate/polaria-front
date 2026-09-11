import { axiosInstance } from '@/lib/axios';

/**
 * Las fotos del negocio: la galería del local y el portfolio de trabajos.
 *
 * `GET/POST/DELETE` sobre `/settings/photos` y `/settings/portfolio`, más el
 * `PATCH` de portada, que sólo tiene la galería.
 *
 * Vive aparte de `settings.service.ts` porque son colecciones con operaciones
 * propias, y no campos del formulario de configuración. Eso además deja
 * redibujar una foto sin volver a pedir la conexión con Meta ni el estado de
 * facturación.
 */

/**
 * Para qué se subió la foto. Espejo de `BusinessPhotoKind` del servidor.
 *
 * `gallery` es el local —la fachada, la sala— y `portfolio` son los trabajos
 * terminados. Son dos colecciones con endpoints propios: el uso no viaja como
 * parámetro, lo fija la ruta.
 */
export type PhotoKind = 'gallery' | 'portfolio';

const PATHS: Record<PhotoKind, string> = {
	gallery: '/settings/photos',
	portfolio: '/settings/portfolio',
};

/**
 * La clave de caché de cada colección.
 *
 * Distintas entre sí para que subir un trabajo no invalide las fotos del local
 * ni al revés: son dos pantallas que conviven en "Mi página" y cada una se
 * redibuja sola.
 */
export const photoKeyOf = (kind: PhotoKind) =>
	['settings', 'photos', kind] as const;

/** La galería del local. Se conserva el nombre porque lo usan las pantallas viejas. */
export const BUSINESS_PHOTOS_KEY = photoKeyOf('gallery');

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

export const getBusinessPhotos = async (
	kind: PhotoKind,
): Promise<BusinessGallery> => {
	const { data } = await axiosInstance.get<BusinessGallery>(PATHS[kind]);
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
	kind: PhotoKind,
	files: File[],
): Promise<BusinessGallery> => {
	const form = new FormData();
	files.forEach((file) => form.append('files', file));

	const { data } = await axiosInstance.post<BusinessGallery>(PATHS[kind], form);

	return data;
};

export const deleteBusinessPhoto = async (
	kind: PhotoKind,
	photoId: string,
): Promise<BusinessGallery> => {
	const { data } = await axiosInstance.delete<BusinessGallery>(
		`${PATHS[kind]}/${photoId}`,
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
