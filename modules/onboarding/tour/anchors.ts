import { ROUTES } from '@/constants/routes';

/**
 * Los puntos de la interfaz que el tutorial sabe señalar.
 *
 * Son un atributo en el DOM y no una referencia de React a propósito: el tutorial
 * ilumina elementos que viven en otras pantallas y que ni siquiera están montados
 * cuando la lección empieza. Pasarse una `ref` entre el menú, el editor de
 * servicios y la agenda pediría un contexto que atraviese todo el árbol; un
 * `data-tour` lo encuentra `querySelector` y no acopla nada.
 *
 * El precio es que un anclaje puede desaparecer si alguien borra el atributo al
 * refactorizar el componente. Por eso los nombres están acá y no sueltos en cada
 * archivo: buscar la constante encuentra los dos extremos.
 */
export const TOUR = {
	navServices: 'nav-services',
	navTeam: 'nav-team',
	navAgenda: 'nav-agenda',

	servicesNew: 'services-new',
	serviceSections: 'service-sections',
	serviceName: 'service-name',
	servicePricing: 'service-pricing',
	serviceSave: 'service-save',

	teamNew: 'team-new',
	teamSections: 'team-sections',
	teamProfile: 'team-profile',
	teamServices: 'team-services',
	teamSave: 'team-save',

	agendaNew: 'agenda-new',
	bookingForm: 'booking-form',
	bookingClient: 'booking-client',
	bookingClientChosen: 'booking-client-chosen',
	appointmentCard: 'appointment-card',
	appointmentMenu: 'appointment-menu',
	appointmentFinish: 'appointment-finish',
} as const;

export type TourAnchor = (typeof TOUR)[keyof typeof TOUR];

/** Lo que se le esparce al elemento que el tutorial tiene que poder encontrar. */
export const anchor = (name: TourAnchor) => ({ 'data-tour': name });

/** El elemento iluminado. El primero: cuando hay varios, el tutorial usa uno. */
export const findAnchor = (name: TourAnchor): HTMLElement | null =>
	document.querySelector<HTMLElement>(`[data-tour="${name}"]`);

/**
 * Cuántos hay.
 *
 * Lo mira el paso que espera que aparezca algo: la tarjeta de una cita nueva en
 * una agenda que ya tenía citas de otro día no cambia el "hay o no hay", pero sí
 * cuántas hay.
 */
export const countAnchors = (name: TourAnchor): number =>
	document.querySelectorAll(`[data-tour="${name}"]`).length;

/**
 * El anclaje de una entrada del menú, buscado por su destino.
 *
 * Así el menú no tiene que declarar un anclaje por ítem: las tres pantallas que
 * el tutorial visita se reconocen por su ruta, y el resto no devuelve nada.
 */
const NAV_ANCHORS: Record<string, TourAnchor> = {
	[ROUTES.services]: TOUR.navServices,
	[ROUTES.team]: TOUR.navTeam,
	[ROUTES.agenda]: TOUR.navAgenda,
};

export const navAnchor = (href: string): TourAnchor | undefined =>
	NAV_ANCHORS[href];
