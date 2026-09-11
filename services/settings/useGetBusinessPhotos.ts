import { useQuery } from '@tanstack/react-query';
import {
	getBusinessPhotos,
	photoKeyOf,
	type BusinessGallery,
	type PhotoKind,
} from './photos.service';

/**
 * Las fotos de una colección: la galería del local o el portfolio.
 *
 * El uso es parte de la clave, así que las dos conviven en la misma pantalla
 * sin pisarse la caché.
 */
const useGetBusinessPhotos = (kind: PhotoKind) => {
	return useQuery<BusinessGallery>({
		queryKey: photoKeyOf(kind),
		queryFn: () => getBusinessPhotos(kind),
	});
};

export default useGetBusinessPhotos;
