export const SETTINGS_KEY = ['settings'] as const;

/*
 * Acá vivían `DEFAULT_SLOT_DURATION` y el formato de hora, que Configuración
 * ofrecía como dos desplegables. Ninguno viajaba al backend ni cambiaba nada:
 * eran configuración aparente. Se quitaron junto con esa sección, y vuelven
 * cuando exista el comportamiento que tienen que controlar —el paso de la grilla
 * de horarios vive hoy en `DEFAULT_SLOT_STEP_MINUTES` del servidor—.
 */

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
