import { axiosInstance } from '@/lib/axios';
import type { WeeklyRange } from '@/modules/schedule/utils/weeklySchedule';

export type SettingsResponse = {
	polariaName: string;
	/** Ver `BUSINESS_TYPES`. `null` hasta que la configuración inicial lo carga. */
	businessType: string | null;
	timezone: string;
	/** Moneda del negocio, en ISO 4217. La necesita cualquier pantalla con precios. */
	currency: string;
	location: { latitude: number; longitude: number } | null;
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
		/**
		 * Estado de la plantilla con la que se envían los recordatorios. Solo
		 * `APPROVED` permite enviarlos.
		 */
		reminderTemplateStatus: string;
		reminderTemplateMetaStatus: string | null;
	};
	/**
	 * Recordatorios del negocio. Aparte de `whatsappConnection` porque es una
	 * capacidad del negocio y no del canal.
	 */
	reminders: {
		/** Anticipaciones activas, en minutos. Lista vacía = desactivados. */
		offsets: number[];
		/** El mensaje real con datos de ejemplo, armado por el backend. */
		previewText: string;
		/** Los botones de la plantilla, en orden: parte de lo que ve el cliente. */
		previewButtons: string[];
	};
};

export type UpdateSettingsPayload = {
	polariaName?: string;
	businessType?: string;
	timezone?: string;
	/** `null` borra la ubicación; ausente la deja como está. */
	location?: { latitude: number; longitude: number } | null;
	businessHours?: WeeklyRange[];
	/** Apagado, Polaria deja de responder por WhatsApp en todo el negocio. */
	aiEnabled?: boolean;
	/** Anticipaciones a activar, en minutos. Lista vacía apaga los recordatorios. */
	reminderOffsets?: number[];
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
		businessType: payload.businessType,
		timezone: payload.timezone,
		location: payload.location,
		businessHours: payload.businessHours,
		aiEnabled: payload.aiEnabled,
		reminderOffsets: payload.reminderOffsets,
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
