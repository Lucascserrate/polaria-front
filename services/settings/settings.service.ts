import { axiosInstance } from '@/lib/axios';
import type { WeeklyRange } from '@/modules/schedule/utils/weeklySchedule';

export type SettingsResponse = {
	polariaName: string;
	/**
	 * Identificador del negocio en su página pública de reservas. `null` hasta
	 * que guarda su nombre por primera vez.
	 *
	 * No se edita: se asigna una sola vez a partir del nombre y no cambia aunque
	 * el negocio se renombre, porque el enlace ya está pegado en un QR y en una
	 * biografía de Instagram.
	 */
	slug: string | null;
	/** El enlace ya armado, que es lo que el negocio comparte. */
	publicBookingUrl: string | null;
	/** Dirección del local en texto, para la página pública. */
	address: string | null;
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
	 * Si la WABA puede pagarle a Meta los mensajes.
	 *
	 * Aparte de `whatsappConnection` porque son preguntas distintas y se resuelven en
	 * lugares distintos: la conexión con Embedded Signup, esto en el Billing Hub de
	 * Meta. Una WABA conectada puede no poder enviar nada.
	 */
	whatsappBilling: {
		/**
		 * `PENDING_SETUP` | `UNKNOWN` | `ACTION_REQUIRED`. Ninguno afirma que el
		 * negocio pueda enviar: eso solo lo confirma un envío que no falle.
		 */
		status: string;
		/** Lo que dijo Meta, con sus palabras. */
		reason: string | null;
		checkedAt: string | null;
		/** El flujo oficial de Meta. `null` si faltan los ids para armarlo. */
		setupUrl: string | null;
	};
	/** Si el negocio activó los avisos automáticos, al equipo y a los clientes. */
	notificationsEnabled: boolean;
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
	notificationsEnabled?: boolean;
	polariaName?: string;
	businessType?: string;
	timezone?: string;
	/** `null` borra la ubicación; ausente la deja como está. */
	location?: { latitude: number; longitude: number } | null;
	/** Misma regla: `null` la borra, ausente la deja como está. */
	address?: string | null;
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
	/*
	 * Se manda `payload` entero y no una lista de campos escrita a mano.
	 *
	 * La lista existía y se olvidó de `notificationsEnabled`: el tipo lo tenía, así
	 * que compilaba, y el interruptor "no dejaba desactivar" porque el PATCH salía sin
	 * el campo y el backend no cambiaba nada. `UpdateSettingsPayload` ya define
	 * exactamente qué se puede mandar; repetirlo acá solo agregaba un lugar donde
	 * quedar desincronizado sin que nada avise.
	 */
	const { data } = await axiosInstance.patch<SettingsResponse>(
		'/settings',
		payload,
	);

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

/**
 * El marco del negocio: zona horaria, moneda y horario.
 *
 * Lo puede leer cualquier rol, a diferencia de `getSettings`, que es de
 * administración. Lo usan las pantallas que solo necesitan dibujarse —la agenda de
 * un profesional— y no configurar nada.
 */
export type BusinessContextResponse = {
	polariaName: string;
	timezone: string;
	currency: string;
	businessHours: WeeklyRange[];
};

export const getBusinessContext =
	async (): Promise<BusinessContextResponse> => {
		const { data } = await axiosInstance.get('/settings/context');
		return data;
	};

/**
 * El negocio dice que ya configuró la facturación en el Billing Hub de Meta.
 *
 * Se le cree y el estado vuelve a "no sabemos", que no bloquea. No es una
 * verificación: si el problema sigue, el próximo envío fallido lo vuelve a marcar.
 */
export const refreshWhatsappBilling = async (): Promise<SettingsResponse> => {
	const { data } = await axiosInstance.post('/settings/whatsapp/billing/check');
	return data;
};
