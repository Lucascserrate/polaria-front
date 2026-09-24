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
	/**
	 * Quién lo atiende, o `null` para "cualquiera".
	 *
	 * `null` es un estado de paso, no uno que se guarde: al elegir la hora se
	 * resuelve a alguien que esté libre. Existe porque al agregar un servicio
	 * todavía no hay horario, y sin horario no se puede saber quién está
	 * disponible — elegir a alguien ahí es elegir a ciegas, que es justo lo que
	 * dejaba la pantalla esperando una hora que para esa persona no existía.
	 */
	staffId: string | null;
	/**
	 * Lo eligió el sistema, no quien está cargando la reserva.
	 *
	 * Sirve para poder **reasignarlo** si cambia la hora: quien quedó libre a las
	 * 15:00 puede estar ocupado a las 17:00. Al que se eligió a mano no se lo
	 * toca nunca: si el negocio dijo "con Fabián", la respuesta a que Fabián no
	 * pueda es decirlo, no cambiarlo por otro.
	 */
	autoStaff?: boolean;
}

/** Si todos los tramos tienen ya un profesional concreto. */
export const isFullyStaffed = (
	items: DraftItem[],
): items is Array<DraftItem & { staffId: string }> =>
	items.every((item) => item.staffId !== null);

/**
 * Reparte profesionales entre los tramos que quedaron en "cualquiera".
 *
 * `eligibleByItem` trae, para el horario elegido, quiénes pueden atender cada
 * tramo. Se recorren en orden y **no se repite a nadie dentro de un mismo
 * instante de arranque**: dos servicios que empiezan a la vez no los puede hacer
 * la misma persona. Entre tramos encadenados sí puede repetirse, que es lo
 * normal —el corte y la barba los hace el mismo barbero—.
 *
 * Los que ya tienen a alguien elegido a mano se respetan tal cual, incluso si
 * esa persona aparece también como candidata de otro tramo.
 */
export const assignPendingStaff = (input: {
	items: DraftItem[];
	eligibleByItem: string[][];
	offsets: number[];
}): DraftItem[] => {
	const { items, eligibleByItem, offsets } = input;

	/** A quién ya se le dio cada instante de arranque. */
	const takenAt = new Map<number, Set<string>>();

	const claim = (index: number, staffId: string) => {
		const offset = offsets[index] ?? index;
		const current = takenAt.get(offset) ?? new Set<string>();
		current.add(staffId);
		takenAt.set(offset, current);
	};

	items.forEach((item, index) => {
		if (item.staffId && !item.autoStaff) claim(index, item.staffId);
	});

	return items.map((item, index) => {
		if (item.staffId && !item.autoStaff) return item;

		const busy = takenAt.get(offsets[index] ?? index) ?? new Set<string>();
		const candidates = eligibleByItem[index] ?? [];

		/*
		 * Se prefiere conservar al que ya estaba si sigue pudiendo: cambiar de
		 * profesional en cada toque de la lista de horarios se lee como un error de
		 * la pantalla, aunque los dos sean válidos.
		 */
		const keep =
			item.staffId &&
			candidates.includes(item.staffId) &&
			!busy.has(item.staffId)
				? item.staffId
				: null;

		const chosen = keep ?? candidates.find((id) => !busy.has(id)) ?? null;
		if (chosen) claim(index, chosen);

		return { ...item, staffId: chosen, autoStaff: true };
	});
};

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

/**
 * Los tramos guardados como borrador editable.
 *
 * Los que no tienen profesional se omiten, igual que antes: una reserva vieja
 * sin asignar no se puede replanificar sin inventar datos, y eso ya lo
 * contempla `canEdit`.
 */
export const toDraftItems = (segments: AppointmentSegment[]): DraftItem[] =>
	segments.flatMap((segment) =>
		segment.staffId
			? [{ serviceId: segment.serviceId, staffId: segment.staffId }]
			: [],
	);

/**
 * En qué minuto arrancó cada tramo de una cita **ya guardada**.
 *
 * Es la verdad sobre esa reserva: si sus dos servicios se atendieron a la vez,
 * los dos dan `0`. Se usa al abrir el drawer para que los horarios se dibujen
 * como están en la agenda desde el primer cuadro, sin esperar a que el servidor
 * confirme el reparto y sin pasar por el encadenado, que mostraría el segundo
 * servicio una hora más tarde de lo que realmente es.
 */
export const savedOffsetsOf = (
	appointmentStart: string,
	segments: AppointmentSegment[],
): number[] => {
	const start = new Date(appointmentStart).getTime();
	if (Number.isNaN(start)) return [];

	return segments.flatMap((segment) => {
		if (!segment.staffId) return [];

		const segmentStart = new Date(segment.startTime).getTime();
		if (Number.isNaN(segmentStart)) return [0];

		return [Math.max(0, Math.round((segmentStart - start) / 60_000))];
	});
};

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
 *
 * **`totalMinutes` es lo que la reserva ocupa, no la suma de los servicios.** Con
 * dos servicios simultáneos son dos cosas distintas: una manicure y una pedicure
 * de una hora cada una ocupan una hora, y sumarlas diría dos. Por eso se mide
 * sobre los `offsets`, que son los que saben qué arranca junto con qué.
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
	/**
	 * En qué minuto arranca cada servicio. Ausente encadena, que es lo que hacen
	 * las reservas sin servicios simultáneos.
	 */
	offsets?: number[];
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

	let chained = 0;
	let totalMinutes = 0;
	let unpriced = 0;
	const priced: DraftPrice[] = [];

	input.items.forEach((item, index) => {
		const service = byId.get(item.serviceId);
		if (!service) return;

		const offsetMinutes = input.offsets?.[index] ?? chained;
		chained = offsetMinutes + service.durationMinutes;

		// El que termina más tarde, que con servicios simultáneos no es el último.
		totalMinutes = Math.max(
			totalMinutes,
			offsetMinutes + service.durationMinutes,
		);

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
 *
 * **Es el respaldo, no la respuesta.** Encadena siempre, y eso deja de ser
 * cierto en cuanto el negocio declara que dos categorías se atienden a la vez:
 * ahí el reparto depende de sus reglas y de a quién se asignó cada servicio, que
 * son datos del servidor. La respuesta buena la da `useGetBookingLayout`; esto
 * es lo que se dibuja mientras llega, y lo único que hace falta en un negocio
 * sin reglas cargadas, que son casi todos.
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

/**
 * Los tramos como los recibe el backend: con profesional sí o sí.
 *
 * Los que quedaron en "cualquiera" se omiten en lugar de mandarse vacíos. No
 * debería llegar ninguno —`canSave` lo impide—, y si llegara es preferible una
 * reserva con un servicio menos que un 400 sin explicación.
 */
export const toBookingItems = (
	items: DraftItem[],
): Array<{ serviceId: string; staffId: string }> =>
	items.flatMap((item) =>
		item.staffId ? [{ serviceId: item.serviceId, staffId: item.staffId }] : [],
	);

/**
 * El tramo que se agrega cuando se elige un servicio.
 *
 * Propone un profesional —el que ya está en la reserva, o el de la columna desde
 * la que se abrió el drawer— y lo marca como **automático**: es una corazonada,
 * no una decisión. Si a la hora que se termine eligiendo esa persona está
 * ocupada, `assignPendingStaff` la reemplaza por alguien libre.
 *
 * **Nunca cae al primero de la lista.** Eso era elegir a ciegas: al agregar un
 * servicio todavía no hay horario contra el cual saber quién está disponible, y
 * la pantalla terminaba ofreciendo los horarios de esa persona, que podían ser
 * ninguno. Sin ninguna pista, el tramo queda en "cualquiera" y lo resuelve la
 * hora.
 *
 * Vive acá y no en cada drawer porque son tres los lugares que agregan un
 * servicio —el buscador de la reserva nueva, el de la edición y el editor de la
 * lista— y con tres copias alcanza con arreglar dos para que el problema siga
 * pareciendo arreglado.
 */
export const draftItemFor = (input: {
	serviceId: string;
	/** Profesionales que pueden hacer ese servicio. */
	eligible: Array<{ id: string }>;
	/** Los tramos que ya tiene la reserva. */
	items: DraftItem[];
	/** La columna desde la que se abrió el drawer, si la hubo. */
	preferredStaffId?: string | null;
}): DraftItem => {
	const { serviceId, eligible, items, preferredStaffId } = input;

	const preferred =
		eligible.find((member) =>
			items.some((item) => item.staffId === member.id),
		) ?? eligible.find((member) => member.id === preferredStaffId);

	return { serviceId, staffId: preferred?.id ?? null, autoStaff: true };
};
