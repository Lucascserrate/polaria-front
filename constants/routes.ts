export const ROUTES = {
	agenda: '/agenda',
	auth: '/auth',
	onboarding: '/onboarding',
	setup: '/setup',
	chat: '/chat',
	analytics: '/analytics',
	services: '/services',
	servicesNew: '/services/new',
	myPage: '/my-page',
	settings: '/settings',
	settingsBusiness: '/settings/business',
	settingsPhotos: '/settings/photos',
	settingsHours: '/settings/hours',
	settingsWhatsapp: '/settings/whatsapp',
	settingsReminders: '/settings/reminders',
	settingsWelcome: '/settings/welcome',
	team: '/team',
	teamNew: '/team/new',
	clients: '/clients',
	myAgenda: '/my-agenda',
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
