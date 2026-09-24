'use client';

import { useMemo, useState } from 'react';
import type { AppointmentDetailApi } from '@/types/appointments.types';
import type { BookingSlotItem } from '@/services/availability/useGetSlotsForBooking';
import type { EditableService } from './BookingServicesEditor';
import useGetBookingLayout from '@/services/availability/useGetBookingLayout';
import {
	assignPendingStaff,
	isFullyStaffed,
	itemsChanged,
	offsetsOf,
	pricesOf,
	savedOffsetsOf,
	summarizeDraft,
	toDraftItems,
	type DraftItem,
	type DraftPrice,
	type DraftSummary,
} from './utils/bookingDraft';
import { dateKeyInTimeZone } from './utils/calendarLayout';

/**
 * La reserva en construcción, con todo lo que se deriva de ella.
 *
 * Crear y editar son la misma operación con distinto punto de partida: una
 * arranca de un borrador vacío y la otra de una reserva existente. Por eso el
 * estado vive acá y no en el componente — así las dos pantallas comparten las
 * cuentas en lugar de tener cada una su versión.
 *
 * Las decisiones puras —duración, total, precios pactados, desplazamiento de
 * cada tramo— están en `utils/bookingDraft`, que se prueba sin React. Este hook
 * solo sostiene el estado y compone.
 */

export interface UseBookingDraftInput {
	/** La reserva que se edita, o `null` para empezar de cero. */
	booking: AppointmentDetailApi | null | undefined;
	/** Catálogo vigente: de ahí salen duración y precio de lo que se agrega. */
	services: EditableService[];
	/** Zona del negocio. Define a qué día pertenece el horario elegido. */
	timezone?: string;
}

/** El cliente de la reserva. Sin `id` es alguien que todavía no existe. */
export interface DraftClient {
	id: string | null;
	name: string;
	phone?: string | null;
}

export interface BookingDraftState {
	client: DraftClient;
	items: DraftItem[];
	/** Inicio elegido, en ISO. `null` mientras no haya ninguno. */
	startTime: string | null;
	/** Día al que pertenece ese inicio, en la zona del negocio. */
	dayKey: string | null;
	/** Minutos en que arranca cada tramo dentro de la reserva. */
	offsets: number[];
	/** Lo que se cobra por cada tramo, en el mismo orden que `items`. */
	prices: DraftPrice[];
	summary: DraftSummary;
	/** Los tramos como los necesita la consulta de disponibilidad. */
	slotItems: BookingSlotItem[];
	timeChanged: boolean;
	servicesChanged: boolean;
	hasChanges: boolean;
	/**
	 * Si la reserva se puede editar desde acá.
	 *
	 * Un tramo guardado sin profesional no se puede replanificar sin inventar
	 * datos, así que esa reserva se muestra pero no se toca.
	 */
	canEdit: boolean;
	setClient: (client: DraftClient) => void;
	setItems: (items: DraftItem[]) => void;
	/**
	 * `null` suelta el horario elegido.
	 *
	 * Lo necesita cambiar de día en la reserva nueva: los horarios libres del día
	 * nuevo son otros, así que conservar el anterior dejaría la reserva apuntando
	 * a un instante que ya no pertenece al día que se está mirando.
	 */
	setStartTime: (startTime: string | null) => void;
	/**
	 * Elige la hora y reparte los tramos que quedaron en "cualquiera".
	 *
	 * Van juntos porque quién puede atender **depende** de la hora: elegirlos por
	 * separado es lo que dejaba a la reserva con alguien ocupado y sin horarios
	 * que ofrecer. `eligibleByItem` trae, para esa hora, los candidatos de cada
	 * tramo, en el mismo orden.
	 */
	chooseStartTime: (startTime: string, eligibleByItem: string[][]) => void;
	/** Si todos los tramos tienen ya un profesional: sin esto no se puede guardar. */
	isStaffed: boolean;
	/** Vuelve todo a lo guardado. */
	discard: () => void;
}

const useBookingDraft = ({
	booking,
	services,
	timezone,
}: UseBookingDraftInput): BookingDraftState => {
	/** `null` significa "como está guardado", que en creación es vacío. */
	const [draftItems, setDraftItems] = useState<DraftItem[] | null>(null);
	const [draftStart, setDraftStart] = useState<string | null>(null);
	const [draftClient, setDraftClient] = useState<DraftClient | null>(null);

	// Memoizado porque alimenta el resto de los cálculos: `?? []` crearía un
	// array nuevo en cada render y recalcularía todo sin que nada cambie.
	const segments = useMemo(() => booking?.segments ?? [], [booking?.segments]);

	const savedItems = useMemo(() => toDraftItems(segments), [segments]);
	const items = draftItems ?? savedItems;

	const startTime = draftStart ?? booking?.startTime ?? null;
	const timeChanged = draftStart !== null && draftStart !== booking?.startTime;
	const servicesChanged = itemsChanged(savedItems, items);

	const agreedPrices = useMemo(
		() =>
			new Map(
				segments.map((segment) => [
					segment.serviceId,
					{ price: segment.price, currency: segment.currency },
				]),
			),
		[segments],
	);

	/**
	 * Dónde arranca cada tramo.
	 *
	 * Lo decide el servidor, porque depende de qué categorías declaró el negocio
	 * que se atienden a la vez y de a quién se asignó cada servicio: es la misma
	 * cuenta que va a hacer al guardar. Calcularla también acá era lo que hacía
	 * que el drawer mostrara dos horas para una reserva que se escribía en una.
	 *
	 * Mientras la respuesta no llegó se dibuja lo mejor que se sabe, en este
	 * orden: los tramos **guardados**, cuando se está editando y los servicios no
	 * cambiaron —ésa es la verdad sobre esa cita—, y si no, encadenado, que es lo
	 * correcto en un negocio sin reglas cargadas.
	 */
	const layout = useGetBookingLayout(items, items.length > 1);

	/** El inicio **guardado**, que es contra el que se miden los tramos guardados. */
	const savedStart = booking?.startTime ?? null;

	const offsets = useMemo(() => {
		const resolved = layout.data?.offsetsMinutes;
		if (resolved && resolved.length === items.length) return resolved;

		if (savedStart && !servicesChanged) {
			const saved = savedOffsetsOf(savedStart, segments);
			if (saved.length === items.length) return saved;
		}

		return offsetsOf({ items, services });
	}, [layout.data, items, services, savedStart, segments, servicesChanged]);

	const prices = useMemo(
		() => pricesOf({ items, services, agreedPrices }),
		[items, services, agreedPrices],
	);

	/**
	 * Elegir la hora y repartir van en la misma acción: quién está libre depende
	 * de la hora, así que hacerlo en dos pasos deja un estado intermedio en el
	 * que la reserva tiene hora y un profesional que a esa hora no puede.
	 */
	const chooseStartTime = (startTime: string, eligibleByItem: string[][]) => {
		setDraftStart(startTime);
		setDraftItems(
			assignPendingStaff({
				items,
				eligibleByItem,
				offsets,
			}),
		);
	};

	const summary = useMemo(
		() => summarizeDraft({ items, services, agreedPrices, offsets }),
		[items, services, agreedPrices, offsets],
	);

	/**
	 * Los tramos con su desplazamiento, para preguntar disponibilidad.
	 *
	 * La duración es la **vigente** del servicio y no la que se guardó al
	 * reservar: es la que va a usar el backend para reacomodar los tramos, y con
	 * la vieja se ofrecerían horarios que después rechaza.
	 */
	const slotItems = useMemo<BookingSlotItem[]>(
		() =>
			items.map((item, index) => ({
				serviceId: item.serviceId,
				/*
				 * Sólo se fija el profesional que se eligió **a mano**.
				 *
				 * Al que propuso el sistema se le pregunta por todo el equipo, y no
				 * es un detalle: preguntando por él, los horarios que vuelven son los
				 * suyos y la lista de candidatos de cada hora lo tiene sólo a él. Con
				 * esa respuesta el reparto no puede elegir a nadie más, por más que
				 * esté ocupado — la pregunta se contestaba a sí misma.
				 */
				staffId: item.autoStaff ? null : item.staffId,
				offsetMinutes: offsets[index] ?? 0,
			})),
		[items, offsets],
	);

	const savedClient: DraftClient = {
		id: booking?.client?.id ?? null,
		name: booking?.client?.name ?? booking?.clientName ?? '',
		phone: booking?.client?.phone ?? null,
	};

	return {
		client: draftClient ?? savedClient,
		items,
		startTime,
		dayKey: startTime ? dateKeyInTimeZone(startTime, timezone) : null,
		offsets,
		prices,
		summary,
		slotItems,
		timeChanged,
		servicesChanged,
		hasChanges: timeChanged || servicesChanged,
		canEdit: segments.length === 0 || savedItems.length === segments.length,
		setClient: setDraftClient,
		setItems: setDraftItems,
		setStartTime: setDraftStart,
		chooseStartTime,
		isStaffed: isFullyStaffed(items),
		discard: () => {
			setDraftItems(null);
			setDraftStart(null);
			setDraftClient(null);
		},
	};
};

export default useBookingDraft;
