import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyJoinRequests, requestToJoin, signupKeys } from './signup.service';

/** Lo que esta cuenta ya pidió y sigue esperando respuesta. */
export const useMyJoinRequests = () =>
	useQuery({
		queryKey: signupKeys.joinRequests,
		queryFn: getMyJoinRequests,
		retry: false,
	});

/**
 * Pide acceso a un negocio.
 *
 * Invalida los pedidos propios para que la pantalla pase sola a "esperando":
 * la respuesta es solo el id, así que quien sabe cómo se ve la lista es la
 * consulta y no esta mutación.
 */
export const useRequestToJoin = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: requestToJoin,
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: signupKeys.joinRequests,
			});
		},
	});
};
