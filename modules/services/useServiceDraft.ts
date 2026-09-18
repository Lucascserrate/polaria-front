'use client';

import { useMemo, useState } from 'react';
import { DEFAULT_CURRENCY } from '@/lib/currencies';
import type { Service, ServiceBookingPolicy } from '@/types/services.types';

export type ServiceSection = 'details' | 'pricing' | 'booking';

/**
 * Lo que aguantan las columnas del servicio, iguales a las del DTO.
 *
 * Se repite acá y no se pide al servidor porque el punto es que el límite se vea
 * **mientras se escribe**: enterarse al guardar de que la descripción era
 * demasiado larga es enterarse tarde, y es como se veía el error que traía esto
 * —un 500 sin explicación—.
 */
export const SERVICE_TEXT_MAX_LENGTH = 255;

export interface ServiceDraft {
	name: string;
	description: string;
	/**
	 * La categoría elegida, o cadena vacía para "sin categoría".
	 *
	 * Cadena vacía y no `null` porque el valor sale de un `<select>`, y un `null`
	 * en un control nativo lo deja sin controlar. La traducción a `null` la hace
	 * `toPayload`, que es el único lugar que habla con el servidor.
	 */
	categoryId: string;
	/** Como texto porque viene de un `input`: vacío es distinto de cero. */
	duration: string;
	price: string;
	/**
	 * Si el precio se define después de ver al cliente.
	 *
	 * Vive al lado de `price` y no lo reemplaza: quien lo marca sin querer
	 * encuentra su número donde lo dejó al desmarcarlo, y quien lo marca a
	 * propósito no tiene que borrar nada. Lo que se guarda lo decide `toPayload`.
	 */
	quoted: boolean;
	/** La moneda de este precio, en ISO 4217. Ver `PriceField`. */
	currency: string;
	bookingPolicy: ServiceBookingPolicy;
}

/** Lo que se manda a guardar. Sin `timezone`, que lo resuelve la pantalla. */
export interface ServicePayload {
	name: string;
	description: string;
	/** `null` si no está en ninguna categoría. */
	categoryId: string | null;
	durationMinutes: number;
	/** `null` si se cotiza. Ver `QUOTED_PRICE_LABEL`. */
	price: number | null;
	currency: string;
	bookingPolicy: ServiceBookingPolicy;
}

/**
 * Los dos números viven como texto en el borrador.
 *
 * Guardarlos como `number` obligaría a decidir qué es un campo vacío, y las dos
 * respuestas son malas: `0` hace que un servicio a medio cargar parezca gratis y
 * de duración nula, y `NaN` se propaga a la validación como si el usuario hubiera
 * escrito algo inválido cuando todavía no escribió nada.
 */
const toNumber = (value: string): number | null => {
	const trimmed = value.trim();
	if (!trimmed) return null;

	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : null;
};

/**
 * El estado del editor de un servicio.
 *
 * Todo el servicio en un objeto y no un estado por sección, por el mismo motivo
 * que en los editores del equipo y de clientes: la pantalla se **recorre** por
 * secciones pero se guarda de una sola vez, y el botón de la cabecera tiene que
 * saber si hay un error en una sección que no se está mirando.
 */
const useServiceDraft = (
	service?: Service | null,
	/**
	 * La moneda con la que nace un servicio nuevo: la por defecto del negocio.
	 *
	 * Sólo se usa al crear. Un servicio que ya existe trae la suya, y caer acá le
	 * cambiaría la moneda al abrirlo.
	 */
	defaultCurrency = DEFAULT_CURRENCY,
) => {
	const [draft, setDraft] = useState<ServiceDraft>(() => ({
		name: service?.name ?? '',
		description: service?.description ?? '',
		categoryId: service?.categoryId ?? '',
		duration:
			service?.durationMinutes === undefined
				? ''
				: String(service.durationMinutes),
		/*
		 * Sin precio el campo arranca vacío, no en cero: `String(Number(null))`
		 * daba "0", y ese cero se guardaba como un servicio gratis en cuanto alguien
		 * abría el servicio y apretaba guardar sin tocar nada.
		 */
		price:
			service?.price === undefined || service.price === null
				? ''
				: String(Number(service.price)),
		quoted: service?.price === null,
		currency: service?.currency ?? defaultCurrency,
		// Los servicios viejos no traen el campo, y siempre fueron reservables.
		bookingPolicy: service?.bookingPolicy ?? 'CLIENT_BOOKS',
	}));

	const set = <K extends keyof ServiceDraft>(key: K, value: ServiceDraft[K]) =>
		setDraft((current) => ({ ...current, [key]: value }));

	const errors = useMemo(() => {
		const found: Partial<Record<ServiceSection, string>> = {};

		if (!draft.name.trim()) {
			found.details = 'El servicio necesita un nombre.';
		} else if (draft.name.trim().length > SERVICE_TEXT_MAX_LENGTH) {
			found.details = `El nombre no puede tener más de ${SERVICE_TEXT_MAX_LENGTH} caracteres.`;
		} else if (draft.description.trim().length > SERVICE_TEXT_MAX_LENGTH) {
			found.details = `La descripción no puede tener más de ${SERVICE_TEXT_MAX_LENGTH} caracteres.`;
		}

		const duration = toNumber(draft.duration);
		const price = toNumber(draft.price);

		if (duration === null) {
			found.pricing = 'Falta la duración.';
		} else if (!Number.isInteger(duration) || duration <= 0) {
			/*
			 * Entero y positivo porque de la duración depende la agenda: la altura de
			 * la cita y los huecos que se ofrecen se calculan en minutos, y un 0 o un
			 * 12,5 dejaría citas que no se pueden dibujar ni reservar.
			 */
			found.pricing = 'La duración tiene que ser un número de minutos.';
		} else if (!draft.quoted) {
			// El que se cotiza no valida precio: no falta, se decide después.
			if (price === null) {
				found.pricing = 'Falta el precio.';
			} else if (price < 0) {
				found.pricing = 'El precio no puede ser negativo.';
			}
		}

		return found;
	}, [
		draft.name,
		draft.description,
		draft.duration,
		draft.price,
		draft.quoted,
	]);

	const canSave = Object.keys(errors).length === 0;

	/**
	 * El servicio entero, no solo lo que cambió.
	 *
	 * Al contrario del editor de clientes, acá se manda todo: son cuatro campos que
	 * el formulario tiene completos, y un `PATCH` parcial no compra nada mientras
	 * ninguno de ellos tenga una validación que dependa de haber sido tocado.
	 */
	const toPayload = (): ServicePayload => ({
		name: draft.name.trim(),
		description: draft.description.trim(),
		categoryId: draft.categoryId || null,
		durationMinutes: Number(draft.duration.trim()),
		price: draft.quoted ? null : Number(draft.price.trim()),
		currency: draft.currency,
		bookingPolicy: draft.bookingPolicy,
	});

	return { draft, set, errors, canSave, toPayload };
};

export default useServiceDraft;
