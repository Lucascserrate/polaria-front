export const ROUTES = {
	agenda: '/agenda',
	auth: '/auth',
	onboarding: '/onboarding',
	setup: '/setup',
	chat: '/chat',
	analytics: '/analytics',
	services: '/services',
	servicesNew: '/services/new',
	settings: '/settings',
	settingsBusiness: '/settings/business',
	settingsHours: '/settings/hours',
	settingsWhatsapp: '/settings/whatsapp',
	settingsReminders: '/settings/reminders',
	settingsWelcome: '/settings/welcome',
	team: '/team',
	teamNew: '/team/new',
	clients: '/clients',
	/** La agenda de un profesional, acotada a sus propias citas. */
	myAgenda: '/my-agenda',
	/** Los números de un profesional, acotados a su propio trabajo. */
	myStats: '/my-stats',
};

/**
 * La ficha de un cliente, abierta sobre la lista.
 *
 * El drawer vive en la URL y no en el estado del componente porque editar es
 * otra pantalla: al volver hay que reabrir el mismo cliente en la misma
 * pestaña, y eso sólo se puede reconstruir si estaba escrito en la dirección.
 * De paso queda linkeable desde una cita.
 */
export const clientRoute = (id: string, tab?: string) =>
	`${ROUTES.clients}?client=${id}${tab ? `&tab=${tab}` : ''}`;
