import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	photoKeyOf,
	uploadBusinessPhotos,
	type BusinessGallery,
	type PhotoKind,
} from './photos.service';

/**
 * Sube fotos y deja la galería como quedó.
 *
 * Escribe la respuesta en la caché en lugar de invalidar —al revés que
 * `useUpdateSettings`— porque las tres operaciones sobre fotos devuelven la
 * galería completa recién leída de la base: no es lo que el navegador cree que
 * pasó, es lo que quedó. Invalidar agregaría una segunda vuelta a la red justo
 * después de subir cinco fotos desde un teléfono.
 *
 * No se maneja el error acá: el mensaje del backend —cuántas fotos faltan para
 * el máximo, qué formato no se acepta— es lo que hay que mostrar, y eso lo hace
 * la pantalla.
 */
const useUploadBusinessPhotos = (kind: PhotoKind) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (files: File[]) => uploadBusinessPhotos(kind, files),
		onSuccess: (gallery: BusinessGallery) => {
			queryClient.setQueryData(photoKeyOf(kind), gallery);
		},
	});
};

export default useUploadBusinessPhotos;
