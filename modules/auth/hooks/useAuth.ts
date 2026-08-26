import { useQuery } from '@tanstack/react-query';
import { validateToken } from '../auth.service';
import { actorOf, type SessionResponse } from '../session';

const useAuth = () => {
	return useQuery<SessionResponse>({
		queryKey: ['session'],
		queryFn: validateToken,
	});
};

/**
 * Quién entró, o `null` mientras no se sabe.
 *
 * Envuelve a `useAuth` porque casi nadie necesita la respuesta entera: lo que se
 * consulta es el rol, para decidir qué dibujar.
 */
export const useSessionActor = () => {
	const { data, isLoading } = useAuth();
	return { actor: actorOf(data), isLoading };
};

export default useAuth;
