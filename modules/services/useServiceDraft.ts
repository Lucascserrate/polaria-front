'use client';

import { useMemo, useState } from 'react';
import type { Service, ServiceBookingPolicy } from '@/types/services.types';

export type ServiceSection = 'details' | 'pricing' | 'booking';

export interface ServiceDraft {
	name: string;
	description: string;
	/** Como texto porque viene de un `input`: vacío es distinto de cero. */
	duration: string;
	price: string;
	bookingPolicy: ServiceBookingPolicy;
}

/** Lo que se manda a guardar. Sin `timezone`, que lo resuelve la pantalla. */
export interface ServicePayload {
	name: string;
	description?: string;
	durationMinutes: number;
	price: number;
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
const useServiceDraft = (service?: Service | null) => {
	const [draft, setDraft] = useState<ServiceDraft>(() => ({
		name: service?.name ?? '',
		description: service?.description ?? '',
		duration:
			service?.durationMinutes === undefined
				? ''
				: String(service.durationMinutes),
		price: service?.price === undefined ? '' : String(Number(service.price)),
		// Los servicios viejos no traen el campo, y siempre fueron reservables.
		bookingPolicy: service?.bookingPolicy ?? 'CLIENT_BOOKS',
	}));

	const set = <K extends keyof ServiceDraft>(key: K, value: ServiceDraft[K]) =>
		setDraft((current) => ({ ...current, [key]: value }));

	const errors = useMemo(() => {
		const found: Partial<Record<ServiceSection, string>> = {};

		if (!draft.name.trim()) {
			found.details = 'El servicio necesita un nombre.';
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
		} else if (price === null) {
			found.pricing = 'Falta el precio.';
		} else if (price < 0) {
			found.pricing = 'El precio no puede ser negativo.';
		}

		return found;
	}, [draft.name, draft.duration, draft.price]);

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
		description: draft.description.trim() || undefined,
		durationMinutes: Number(draft.duration.trim()),
		price: Number(draft.price.trim()),
		bookingPolicy: draft.bookingPolicy,
	});

	return { draft, set, errors, canSave, toPayload };
};

export default useServiceDraft;
