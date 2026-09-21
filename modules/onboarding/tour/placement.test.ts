import { describe, expect, it } from 'vitest';
import { CALLOUT_WIDTH, placeCallout } from './placement';

const VIEWPORT = { width: 1440, height: 900 };

/** Una fila del menú lateral: angosta, pegada al borde izquierdo. */
const sidebarItem = { top: 200, left: 16, width: 220, height: 44 };

const HEIGHT = 180;

const overlaps = (
	place: { top: number; left: number },
	rect: { top: number; left: number; width: number; height: number },
) =>
	place.left < rect.left + rect.width &&
	place.left + CALLOUT_WIDTH > rect.left &&
	place.top < rect.top + rect.height &&
	place.top + HEIGHT > rect.top;

describe('placeCallout', () => {
	it('sin nada que señalar, el cartel va al centro', () => {
		const place = placeCallout(null, HEIGHT, VIEWPORT);

		expect(place.left).toBe((VIEWPORT.width - CALLOUT_WIDTH) / 2);
		expect(place.top).toBe((VIEWPORT.height - HEIGHT) / 2);
	});

	/*
	 * Un paso cuyo anclaje desapareció —el menú que se cerró, el diálogo que se
	 * abrió encima— no puede plantarse en el centro: ahí está justo lo que lo
	 * reemplazó.
	 */
	it('sin anclaje y con caída al pie, no se queda en el centro', () => {
		const place = placeCallout(null, HEIGHT, VIEWPORT, 'bottom');

		expect(place.top).toBeGreaterThan((VIEWPORT.height - HEIGHT) / 2);
		expect(place.top + HEIGHT).toBeLessThanOrEqual(VIEWPORT.height);
	});

	it('se pone al costado de lo iluminado, no encima', () => {
		const place = placeCallout(sidebarItem, HEIGHT, VIEWPORT);

		expect(place.left).toBeGreaterThan(sidebarItem.left + sidebarItem.width);
		expect(overlaps(place, sidebarItem)).toBe(false);
	});

	it('cuando a la derecha no entra, baja', () => {
		// Un botón pegado al borde derecho: el encabezado de Servicios o de Equipo.
		const rect = { top: 100, left: 1300, width: 120, height: 40 };
		const place = placeCallout(rect, HEIGHT, VIEWPORT);

		expect(place.top).toBeGreaterThan(rect.top + rect.height);
		expect(overlaps(place, rect)).toBe(false);
	});

	it('nunca se sale de la ventana', () => {
		// Abajo a la derecha del todo: el peor caso de los dos ejes a la vez.
		const rect = { top: 850, left: 1380, width: 50, height: 40 };
		const place = placeCallout(rect, HEIGHT, VIEWPORT);

		expect(place.left).toBeGreaterThanOrEqual(0);
		expect(place.top).toBeGreaterThanOrEqual(0);
		expect(place.left + CALLOUT_WIDTH).toBeLessThanOrEqual(VIEWPORT.width);
		expect(place.top + HEIGHT).toBeLessThanOrEqual(VIEWPORT.height);
	});

	/*
	 * El caso que rompió la lección de servicios: el formulario ocupa casi toda
	 * la ventana y no hay costado libre. El cartel iba al centro, o sea encima de
	 * los campos de duración y precio que el paso pedía llenar, y no se podía
	 * escribir. Al pie tapa el espacio muerto del final del formulario.
	 */
	it('con algo enorme iluminado, el cartel baja al pie y no al centro', () => {
		const huge = { top: 0, left: 0, width: 1440, height: 900 };
		const place = placeCallout(huge, HEIGHT, VIEWPORT);

		expect(place.top).toBeGreaterThan((VIEWPORT.height - HEIGHT) / 2);
		expect(place.top + HEIGHT).toBeLessThanOrEqual(VIEWPORT.height);
		expect(place.left).toBeGreaterThanOrEqual(0);
		expect(place.left + CALLOUT_WIDTH).toBeLessThanOrEqual(VIEWPORT.width);
	});
});
