import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	movePhotoToFront,
	photoKeyOf,
	type BusinessGallery,
	type PhotoKind,
} from './photos.service';

/**
 * Manda una foto al frente: portada en la galería, destacada en el portfolio.
 *
 * Ver `useUploadBusinessPhotos` para por qué se escribe la caché y no se
 * invalida.
 */
const useMovePhotoToFront = (kind: PhotoKind) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (photoId: string) => movePhotoToFront(kind, photoId),
		onSuccess: (gallery: BusinessGallery) => {
			queryClient.setQueryData(photoKeyOf(kind), gallery);
		},
	});
};

export default useMovePhotoToFront;
