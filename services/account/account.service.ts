import { axiosInstance } from '@/lib/axios';

/**
 * La cuenta con la que se entró al panel.
 *
 * Se pide aparte de la configuración: son dos campos que no cambian casi nunca,
 * y traerse todo `/settings` en cada pantalla solo para saludar sería pedir el
 * horario semanal y el estado de WhatsApp de regalo.
 */
export const ACCOUNT_KEY = ['account'] as const;

export interface Account {
	/** Con quién se saluda: la persona si entró por el equipo, el negocio si no. */
	name: string;
	/** El negocio al que pertenece la sesión, siempre. */
	businessName: string;
	/** Correo de Google. Puede faltar en cuentas dadas de alta a mano. */
	email: string | null;
	/**
	 * Correo del super admin que abrió esta sesión de soporte, o `null` si entró
	 * el negocio. Es lo único que distingue a una sesión suplantada: para todo lo
	 * demás, la respuesta es idéntica a la del dueño.
	 */
	impersonatedBy: string | null;
}

export const getAccount = async (): Promise<Account> => {
	const { data } = await axiosInstance.get<Account>('/auth/account');
	return data;
};

/**
 * Cierra la sesión de soporte y devuelve al super admin a su propia cuenta.
 *
 * Es solo borrar una cookie: la sesión propia nunca se tocó, así que no hay que
 * volver a pasar por Google.
 */
export const exitImpersonation = async (): Promise<void> => {
	await axiosInstance.post('/support/impersonate/exit');
};
