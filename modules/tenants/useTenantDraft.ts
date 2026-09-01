'use client';

import { useMemo, useState } from 'react';
import type {
	Tenant,
	TenantLocation,
	TenantStatus,
	UpdateTenantDto,
} from '@/types/tenant.types';

/**
 * El estado del editor de un negocio.
 *
 * Todo el formulario en un solo objeto y no un estado por sección, porque al
 * guardar se manda una sola vez: la pantalla se **recorre** por secciones, pero
 * es una sola ficha. Por eso la validación también vive acá: el botón de guardar
 * está en la cabecera y tiene que saber si hay un error en una sección que no se
 * está mirando.
 */
export interface TenantDraft {
	name: string;
	businessType: string;
	email: string;
	timezone: string;
	address: string;
	/** `null` mientras el negocio no tenga coordenadas cargadas. */
	location: TenantLocation | null;
	status: TenantStatus;
	aiEnabled: boolean;
}

export type SectionKey = 'profile' | 'location' | 'whatsapp' | 'system';

export interface DraftIssues {
	/** Impiden guardar. */
	errors: Partial<Record<SectionKey, string>>;
	/** No impiden nada: es lo que conviene saber antes de guardar. */
	warnings: Partial<Record<SectionKey, string[]>>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Las coordenadas guardadas, si están las dos.
 *
 * Una sola no ubica nada, y el backend las deja nulables por separado, así que
 * media ubicación es un estado posible que acá se trata como ninguna.
 */
const locationOf = (tenant: Tenant): TenantLocation | null =>
	typeof tenant.latitude === 'number' && typeof tenant.longitude === 'number'
		? { latitude: tenant.latitude, longitude: tenant.longitude }
		: null;

const draftFrom = (tenant: Tenant): TenantDraft => ({
	name: tenant.name ?? '',
	businessType: tenant.businessType ?? '',
	email: tenant.email ?? '',
	timezone: tenant.timezone ?? '',
	address: tenant.address ?? '',
	location: locationOf(tenant),
	status: tenant.status ?? 'active',
	aiEnabled: tenant.aiEnabled ?? true,
});

export const useTenantDraft = (tenant: Tenant) => {
	const [draft, setDraft] = useState<TenantDraft>(() => draftFrom(tenant));

	const set = <K extends keyof TenantDraft>(key: K, value: TenantDraft[K]) =>
		setDraft((previous) => ({ ...previous, [key]: value }));

	const issues = useMemo<DraftIssues>(() => {
		const errors: DraftIssues['errors'] = {};
		const warnings: DraftIssues['warnings'] = {};

		if (!draft.name.trim()) {
			errors.profile = 'Falta el nombre del negocio.';
		} else if (draft.email.trim() && !EMAIL_PATTERN.test(draft.email.trim())) {
			errors.profile = 'El correo no tiene un formato válido.';
		} else if (!draft.timezone.trim()) {
			errors.profile = 'Falta la zona horaria.';
		}

		/*
		 * Dirección sin coordenadas, o al revés: se guarda igual y se avisa.
		 *
		 * No son el mismo dato ni sirven para lo mismo —la dirección se lee en la
		 * página pública, las coordenadas se envían por WhatsApp—, así que tener
		 * una sola no es un error, pero sí es la razón por la que después va a
		 * faltar en un lado.
		 */
		if (draft.address.trim() && !draft.location) {
			warnings.location = [
				'Sin coordenadas, Polaria no puede enviarle la ubicación al cliente por WhatsApp.',
			];
		} else if (!draft.address.trim() && draft.location) {
			warnings.location = [
				'Sin dirección escrita, la página pública de reservas no muestra dónde queda el local.',
			];
		}

		return { errors, warnings };
	}, [draft]);

	const canSave = Object.keys(issues.errors).length === 0;

	/**
	 * Lo que se manda al guardar.
	 *
	 * La dirección viaja como `null` cuando queda vacía y no como `''`, porque es
	 * la única forma de borrarla: TypeORM ignora lo que llega `undefined`.
	 *
	 * Nada de WhatsApp pasa por acá. La conexión no se edita como un campo: la
	 * escribe Meta al terminar el Embedded Signup, y si viviera en el borrador,
	 * guardar después de conectar pisaría las credenciales nuevas con las que se
	 * leyeron al abrir la pantalla.
	 */
	const toPayload = (): UpdateTenantDto => ({
		name: draft.name.trim(),
		businessType: draft.businessType.trim() || undefined,
		email: draft.email.trim() || undefined,
		timezone: draft.timezone.trim(),
		address: draft.address.trim() || null,
		latitude: draft.location?.latitude ?? null,
		longitude: draft.location?.longitude ?? null,
		status: draft.status,
		aiEnabled: draft.aiEnabled,
	});

	return { draft, set, issues, canSave, toPayload };
};

export default useTenantDraft;
