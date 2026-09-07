import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
	BUSINESS_PHOTOS_KEY,
	deleteBusinessPhoto,
	type BusinessGallery,
} from './photos.service';

/** Ver `useUploadBusinessPhotos` para por qué se escribe la caché y no se invalida. */
const useDeleteBusinessPhoto = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: deleteBusinessPhoto,
		onSuccess: (gallery: BusinessGallery) => {
			queryClient.setQueryData(BUSINESS_PHOTOS_KEY, gallery);
		},
	});
};

export default useDeleteBusinessPhoto;
