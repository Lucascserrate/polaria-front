import type { AppointmentSegment } from '@/types/appointments.types';

/**
 * La reserva en edición: qué servicios tiene, con quién, y cuánto suma.
 *
 * Es puro porque son las cuentas que el drawer muestra antes de guardar, y una
 * cuenta mal hecha acá no falla: muestra un total equivocado y el negocio le
 * cobra eso al cliente.
 *
 * El precio replica a propósito lo que hace el backend en `booking-plan.ts`: un
 * servicio que la reserva **ya tenía** conserva el precio pactado y uno que se
 * agrega ahora entra con el precio de hoy. El backend sigue siendo la autoridad;
 * esto es la vista previa de lo que va a decidir.
 */

export interface DraftItem {
	serviceId: string;
	staffId: string;
}

export interface ServiceOption {
	id: string;
	durationMinutes: number;
	price: number;
}

/** Los tramos guardados como borrador editable. */
export const toDraftItems = (segments: AppointmentSegment[]): DraftItem[] =>
	segments.flatMap((segment) =>
		segment.staffId
			? [{ serviceId: segment.serviceId, staffId: segment.staffId }]
			: [],
	);

/**
 * Si el borrador difiere de lo guardado.
 *
 * El orden cuenta: mover la barba antes del corte cambia a qué hora atiende cada
 * profesional, así que es un cambio real y no un reordenamiento cosmético.
 */
export const itemsChanged = (
	saved: DraftItem[],
	draft: DraftItem[],
): boolean => {
	if (saved.length !== draft.length) return true;

	return saved.some(
		(item, index) =>
			item.serviceId !== draft[index].serviceId ||
			item.staffId !== draft[index].staffId,
	);
};

export interface DraftSummary {
	totalMinutes: number;
	totalPrice: number;
	/** Servicios del borrador que ya no existen o están inactivos. */
	unknownServiceIds: string[];
}

/**
 * Cuánto dura y cuánto sale el borrador.
 *
 * La duración es siempre la vigente del servicio: es la que va a usar el backend
 * para reacomodar los tramos, y con la vieja la agenda diría una cosa y la
 * disponibilidad otra.
 */
export const summarizeDraft = (input: {
	items: DraftItem[];
	services: ServiceOption[];
	/** Precio ya pactado por servicio, de los tramos que la reserva ya tenía. */
	agreedPrices?: Map<string, number>;
}): DraftSummary => {
	const byId = new Map(input.services.map((service) => [service.id, service]));

	const unknownServiceIds = [
		...new Set(
			input.items
				.map((item) => item.serviceId)
				.filter((serviceId) => !byId.has(serviceId)),
		),
	];

	let totalMinutes = 0;
	let totalPrice = 0;

	for (const item of input.items) {
		const service = byId.get(item.serviceId);
		if (!service) continue;

		totalMinutes += service.durationMinutes;
		totalPrice += input.agreedPrices?.get(item.serviceId) ?? service.price;
	}

	return { totalMinutes, totalPrice, unknownServiceIds };
};

/**
 * Los minutos en que arranca cada tramo dentro de la reserva.
 *
 * Es lo que necesita la consulta de disponibilidad: el primero arranca con la
 * reserva y cada siguiente después de lo que duró el anterior.
 */
export const offsetsOf = (input: {
	items: DraftItem[];
	services: ServiceOption[];
}): number[] => {
	const byId = new Map(input.services.map((service) => [service.id, service]));

	return input.items.map((_, index) =>
		input.items
			.slice(0, index)
			.reduce(
				(total, item) => total + (byId.get(item.serviceId)?.durationMinutes ?? 0),
				0,
			),
	);
};
