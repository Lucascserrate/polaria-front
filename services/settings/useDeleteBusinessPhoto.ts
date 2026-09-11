import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	deleteBusinessPhoto,
	photoKeyOf,
	type BusinessGallery,
	type PhotoKind,
} from './photos.service';

/** Ver `useUploadBusinessPhotos` para por qué se escribe la caché y no se invalida. */
const useDeleteBusinessPhoto = (kind: PhotoKind) => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (photoId: string) => deleteBusinessPhoto(kind, photoId),
		onSuccess: (gallery: BusinessGallery) => {
			queryClient.setQueryData(photoKeyOf(kind), gallery);
		},
	});
};

export default useDeleteBusinessPhoto;
