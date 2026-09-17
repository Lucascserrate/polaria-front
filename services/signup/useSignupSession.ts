import { useQuery } from '@tanstack/react-query';
import { getSignupSession, signupKeys } from './signup.service';

/**
 * Quién está dándose de alta.
 *
 * Sin reintentos: un 401 acá es el trámite vencido, y volver a pedirlo tres
 * veces no lo revive. La pantalla lo trata como "volvé a entrar".
 */
const useSignupSession = () =>
	useQuery({
		queryKey: signupKeys.session,
		queryFn: getSignupSession,
		retry: false,
	});

export default useSignupSession;
