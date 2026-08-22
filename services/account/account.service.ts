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
	/** Nombre del negocio. Es con el que se saluda. */
	name: string;
	/** Correo de Google. Puede faltar en cuentas dadas de alta a mano. */
	email: string | null;
}

export const getAccount = async (): Promise<Account> => {
	const { data } = await axiosInstance.get<Account>('/auth/account');
	return data;
};
