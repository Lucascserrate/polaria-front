import { useQuery } from '@tanstack/react-query';
import {
	BUSINESS_PHOTOS_KEY,
	getBusinessPhotos,
	type BusinessGallery,
} from './photos.service';

const useGetBusinessPhotos = () => {
	return useQuery<BusinessGallery>({
		queryKey: BUSINESS_PHOTOS_KEY,
		queryFn: getBusinessPhotos,
	});
};

export default useGetBusinessPhotos;
