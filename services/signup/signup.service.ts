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
	businesses: (query: string) => ['signup', 'businesses', query] as const,
	joinRequests: ['signup', 'join-requests'] as const,
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

/** Un negocio en el buscador: lo justo para reconocerlo. */
export interface JoinableBusiness {
	id: string;
	name: string;
	/** "Juan G.", para distinguir dos locales que se llaman parecido. */
	ownerName: string | null;
	logoUrl: string | null;
}

export interface PendingJoinRequest {
	id: string;
	businessName: string;
	createdAt: string;
}

/** Lo que el servidor exige para buscar. Se repite acá para no pedir de menos. */
export const MIN_SEARCH_LENGTH = 3;

export const searchBusinesses = async (
	query: string,
): Promise<JoinableBusiness[]> => {
	const { data } = await axiosInstance.get<JoinableBusiness[]>(
		'/signup/businesses',
		{ params: { q: query } },
	);
	return data;
};

export const requestToJoin = async (
	tenantId: string,
): Promise<{ id: string }> => {
	const { data } = await axiosInstance.post<{ id: string }>(
		'/signup/join-requests',
		{ tenantId },
	);
	return data;
};

export const getMyJoinRequests = async (): Promise<PendingJoinRequest[]> => {
	const { data } = await axiosInstance.get<PendingJoinRequest[]>(
		'/signup/join-requests',
	);
	return data;
};
