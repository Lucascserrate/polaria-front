'use client';

import { useMemo, useState } from 'react';
import type { ClientApi } from '@/types/appointments.types';
import type { ClientPayload } from '@/services/clients/clients.service';
import { formatClientPhone } from './utils/phone';

export type ClientSection = 'profile' | 'notes';

export interface ClientDraft {
	name: string;
	phone: string;
	email: string;
	/** `'YYYY-MM-DD'`, como lo entrega y espera el input de fecha. */
	birthDate: string;
	notes: string;
}

/**
 * Sólo los dígitos, para comparar dos escrituras del mismo número.
 *
 * El campo se prellena en formato legible —`+591 79995001`— y se guarda pegado
 * —`59179995001`—. Sin esto, abrir el editor y no tocar nada ya contaría como un
 * cambio, y el botón de guardar quedaría habilitado sobre una ficha intacta.
 */
const digitsOf = (value: string) => value.replace(/\D/g, '');

/**
 * El estado del editor de un cliente.
 *
 * Toda la ficha en un objeto y no un estado por sección, por el mismo motivo que
 * en el editor del equipo: la pantalla se **recorre** por secciones pero se
 * guarda de una sola vez, y el botón de la cabecera tiene que saber si hay un
 * error en una sección que no se está mirando.
 */
const useClientDraft = (client?: ClientApi | null, dialCode?: string) => {
	const [draft, setDraft] = useState<ClientDraft>(() => ({
		name: client?.name ?? '',
		// Legible, no como se guarda: el teléfono se dicta y se lee, y `59179995001`
		// no se lee. Vuelve a normalizarse en el servidor al guardar.
		phone: client?.phone ? formatClientPhone(client.phone, dialCode) : '',
		email: client?.email ?? '',
		birthDate: client?.birthDate ?? '',
		notes: client?.notes ?? '',
	}));

	const set = <K extends keyof ClientDraft>(key: K, value: ClientDraft[K]) =>
		setDraft((current) => ({ ...current, [key]: value }));

	const errors = useMemo(() => {
		const found: Partial<Record<ClientSection, string>> = {};

		if (!draft.name.trim()) {
			found.profile = 'El cliente necesita un nombre.';
		} else if (!draft.phone.trim()) {
			/*
			 * El teléfono es la identidad del cliente entre canales. Vaciarlo lo
			 * volvería irreconocible cuando escriba por WhatsApp, y el backend lo
			 * rechaza igual: avisarlo acá evita que alguien escriba toda la ficha
			 * para que se la devuelvan.
			 */
			found.profile = 'El cliente necesita un teléfono.';
		}

		return found;
	}, [draft.name, draft.phone]);

	const canSave = Object.keys(errors).length === 0;

	/**
	 * Sólo lo que cambió.
	 *
	 * Mandar la ficha entera reescribiría campos que nadie tocó, y el teléfono
	 * volvería a pasar por la normalización en cada guardado aunque no se haya
	 * editado. Un `PATCH` que dice de verdad qué cambió es también lo que hace que
	 * el 409 por teléfono repetido sólo aparezca cuando se tocó el teléfono.
	 */
	const toPayload = (): ClientPayload => {
		const payload: ClientPayload = {};
		const trimmed = {
			name: draft.name.trim(),
			phone: draft.phone.trim(),
			email: draft.email.trim(),
			birthDate: draft.birthDate,
			notes: draft.notes.trim(),
		};

		if (trimmed.name !== (client?.name ?? '')) payload.name = trimmed.name;
		if (digitsOf(trimmed.phone) !== digitsOf(client?.phone ?? '')) {
			payload.phone = trimmed.phone;
		}
		if (trimmed.email !== (client?.email ?? '')) payload.email = trimmed.email;
		if (trimmed.birthDate !== (client?.birthDate ?? '')) {
			payload.birthDate = trimmed.birthDate;
		}
		if (trimmed.notes !== (client?.notes ?? '')) payload.notes = trimmed.notes;

		return payload;
	};

	const isDirty = Object.keys(toPayload()).length > 0;

	return { draft, set, errors, canSave, isDirty, toPayload };
};

export default useClientDraft;
