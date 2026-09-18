import { sumByCurrency, type MoneyTotal } from '@/lib/money';
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
	/** `null` si se cotiza después de ver a la persona. */
	price: number | null;
	currency: string;
}

/** Lo que se cobra en un tramo, con la moneda en la que se cobra. */
export interface DraftPrice {
	price: number | null;
	currency: string;
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
	/**
	 * El total, una entrada por moneda.
	 *
	 * Es una lista y no un número porque una reserva puede mezclar monedas: una
	 * consulta presencial en bolivianos y una sesión online en dólares entran en
	 * la misma cita. Casi siempre trae un elemento.
	 */
	totals: MoneyTotal[];
	/**
	 * Cuántos tramos todavía no tienen precio.
	 *
	 * Se cuentan en vez de sumarse porque el total de una cita con una coloración
	 * sin cotizar no es lo que ya hay: es lo que ya hay **más algo**. Mostrar sólo
	 * la suma diría "Bs 80" de una cita que va a salir bastante más.
	 */
	unpriced: number;
	/** Servicios del borrador que ya no existen o están inactivos. */
	unknownServiceIds: string[];
}

/**
 * Lo que se cobra por cada tramo, en el orden del borrador.
 *
 * Replica lo que hace `booking-plan.ts` en el backend: el tramo que la reserva ya
 * tenía conserva lo pactado, y el que se agrega ahora entra con el precio de hoy
 * del catálogo. La moneda es la pactada, que puede no ser la que el servicio
 * cobra hoy.
 *
 * El precio no se edita desde acá: el de un servicio que se cotiza se escribe al
 * finalizar la cita, que es cuando se sabe. Ver `FinishWithPricesDialog`.
 */
export const pricesOf = (input: {
	items: DraftItem[];
	services: ServiceOption[];
	agreedPrices?: Map<string, DraftPrice>;
}): DraftPrice[] => {
	const byId = new Map(input.services.map((service) => [service.id, service]));

	return input.items.map((item) => {
		const agreed = input.agreedPrices?.get(item.serviceId);
		const service = byId.get(item.serviceId);

		/*
		 * Se pregunta si el tramo **estaba**, no si su precio era un número: un
		 * servicio que se cotiza se guardó sin precio, y con `??` ese hueco se
		 * llenaría con el precio de hoy del catálogo.
		 */
		const base: DraftPrice = agreed ?? {
			price: service?.price ?? null,
			currency: service?.currency ?? '',
		};

		return { price: base.price, currency: base.currency };
	});
};

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
	/**
	 * Precio y moneda ya pactados por servicio, de los tramos que la reserva ya
	 * tenía. Los dos juntos: conservar "8.000" sin conservar que eran guaraníes
	 * no conserva nada.
	 */
	agreedPrices?: Map<string, DraftPrice>;
}): DraftSummary => {
	const byId = new Map(input.services.map((service) => [service.id, service]));

	const unknownServiceIds = [
		...new Set(
			input.items
				.map((item) => item.serviceId)
				.filter((serviceId) => !byId.has(serviceId)),
		),
	];

	const prices = pricesOf(input);

	let totalMinutes = 0;
	let unpriced = 0;
	const priced: DraftPrice[] = [];

	input.items.forEach((item, index) => {
		const service = byId.get(item.serviceId);
		if (!service) return;

		totalMinutes += service.durationMinutes;

		const entry = prices[index];
		if (entry.price === null) unpriced += 1;
		priced.push(entry);
	});

	return {
		totalMinutes,
		totals: sumByCurrency(priced),
		unpriced,
		unknownServiceIds,
	};
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
				(total, item) =>
					total + (byId.get(item.serviceId)?.durationMinutes ?? 0),
				0,
			),
	);
};
