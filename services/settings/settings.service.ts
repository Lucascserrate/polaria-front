import { axiosInstance } from '@/lib/axios';
import type { WeeklyRange } from '@/modules/schedule/utils/weeklySchedule';

export type SettingsResponse = {
	polariaName: string;
	/**
	 * Horario semanal del negocio, una entrada por franja. Un día sin entradas
	 * está cerrado; varias entradas en un mismo día son un turno partido.
	 */
	businessHours: WeeklyRange[];
	aiEnabled: boolean;
	whatsappConnection: {
		connected: boolean;
		businessId: string | null;
		wabaId: string | null;
		phoneNumberId: string | null;
		phoneNumber: string | null;
		/** Nombre que Meta aprobó para el número, no el nombre del negocio en Polaria. */
		verifiedName: string | null;
		connectedAt: string | null;
		/** El número sigue activo en la app de WhatsApp Business (Coexistence). */
		isOnBusinessApp: boolean;
		platformType: string | null;
		/**
		 * Meta informó que la conexión dejó de estar disponible. Las credenciales
		 * siguen guardadas: estas caídas pueden revertirse solas.
		 */
		unavailableSince: string | null;
		unavailableReason: string | null;
	};
};

export type UpdateSettingsPayload = {
	polariaName?: string;
	businessHours?: WeeklyRange[];
	/** Apagado, Polaria deja de responder por WhatsApp en todo el negocio. */
	aiEnabled?: boolean;
};

export const getSettings = async (): Promise<SettingsResponse> => {
	const { data } = await axiosInstance.get<SettingsResponse>('/settings');
	return data;
};

export const updateSettings = async (
	payload: UpdateSettingsPayload,
): Promise<SettingsResponse> => {
	const { data } = await axiosInstance.patch<SettingsResponse>('/settings', {
		polariaName: payload.polariaName,
		businessHours: payload.businessHours,
		aiEnabled: payload.aiEnabled,
	});

	return data;
};

export type CompleteWhatsappEmbeddedSignupPayload = {
	code: string;
	businessId?: string;
	wabaId?: string;
	phoneNumberId?: string;
	phoneNumber?: string;
	systemUserAccessToken?: string;
	coexistence?: boolean;
};

export const completeWhatsappEmbeddedSignup = async (
	payload: CompleteWhatsappEmbeddedSignupPayload,
): Promise<SettingsResponse> => {
	const { data } = await axiosInstance.patch<SettingsResponse>(
		'/settings/whatsapp/embedded-signup',
		payload,
	);

	return data;
};

/**
 * Suelta la conexión del lado de Polaria. No toca nada en Meta: el número sigue
 * existiendo en su WABA y puede volver a conectarse con Embedded Signup.
 */
export const disconnectWhatsapp = async (): Promise<SettingsResponse> => {
	const { data } = await axiosInstance.post<SettingsResponse>(
		'/settings/whatsapp/disconnect',
	);
	return data;
};
