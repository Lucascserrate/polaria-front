import { useQuery } from '@tanstack/react-query';
import {
	MIN_SEARCH_LENGTH,
	searchBusinesses,
	signupKeys,
} from './signup.service';

/**
 * Los negocios que coinciden con lo escrito.
 *
 * No consulta hasta el mínimo de letras: el servidor devolvería vacío igual, y
 * pedirlo con una letra sería una petición por tecla que no puede dar nada.
 */
const useSearchBusinesses = (query: string) => {
	const trimmed = query.trim();

	return useQuery({
		queryKey: signupKeys.businesses(trimmed),
		queryFn: () => searchBusinesses(trimmed),
		enabled: trimmed.length >= MIN_SEARCH_LENGTH,
		retry: false,
	});
};

export default useSearchBusinesses;
