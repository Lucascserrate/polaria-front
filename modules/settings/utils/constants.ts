export const SETTINGS_KEY = ['settings'] as const;

export const DEFAULT_SLOT_DURATION = 30;

export const DEFAULT_SETTINGS = {
	polariaName: 'PolariaName',
	appointmentSlotDuration: DEFAULT_SLOT_DURATION,
};

/**
 * Semana con la que arranca un negocio que todavía no cargó horarios: de lunes
 * a sábado, de 09:00 a 18:00.
 *
 * Es una propuesta editable, no un valor guardado —la base sigue vacía hasta
 * que el dueño confirma—, y existe para que la primera visita a Configuración
 * muestre algo que ajustar en vez de siete días cerrados.
 */
export const DEFAULT_BUSINESS_HOURS = [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
	dayOfWeek,
	startTime: '09:00',
	endTime: '18:00',
}));

export const META_SDK_SRC = 'https://connect.facebook.net/en_US/sdk.js';

/**
 * Evento que Meta emite cuando el negocio conectó su cuenta de la app WhatsApp
 * Business en lugar de crear una WABA nueva (Coexistence).
 */
export const COEXISTENCE_FINISH_EVENT =
	'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING';

export const COEXISTENCE_FEATURE_TYPE = 'whatsapp_business_app_onboarding';
