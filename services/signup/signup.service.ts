import { axiosInstance } from '@/lib/axios';

/**
 * El alta: qué hace en Polaria una cuenta de Google que todavía no es nada.
 *
 * Vive detrás de la cookie del trámite, no de la sesión. Por eso estos son los
 * únicos endpoints que responden mientras no haya negocio, y por eso un 401 acá
 * significa "el trámite venció", no "cerraste sesión".
 */
export const signupKeys = {
	session: ['signup', 'session'] as const,
};

export interface SignupSession {
	/** El correo con el que entró: es el dato que su jefe necesita cargar. */
	email: string | null;
	name: string | null;
}

export const getSignupSession = async (): Promise<SignupSession> => {
	const { data } = await axiosInstance.get<SignupSession>('/signup/session');
	return data;
};

export const createBusiness = async (): Promise<{ tenantId: string }> => {
	const { data } = await axiosInstance.post<{ tenantId: string }>(
		'/signup/business',
	);
	return data;
};
