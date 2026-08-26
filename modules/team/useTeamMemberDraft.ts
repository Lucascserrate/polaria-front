'use client';

import { useMemo, useState } from 'react';
import type {
	StaffAccessRole,
	StaffMember,
	TeamMemberPayload,
} from '@/types/staff.types';
import { toCommissionInput } from '@/modules/staff/utils/commission';
import {
	fromScheduleDraft,
	toScheduleDraft,
	validateScheduleDraft,
	type ScheduleDraft,
} from '@/modules/schedule/utils/weeklySchedule';
import {
	buildDefaultDraft,
	findBusinessHoursWarnings,
} from '@/modules/staff/utils/schedule';
import useGetSettings from '@/services/settings/useGetSettings';
import {
	DEFAULT_PHONE_CODE,
	joinPhone,
	providesServicesByDefault,
	splitPhone,
} from './utils/roles';

/**
 * El estado del editor de un miembro del equipo.
 *
 * Todo el formulario en un solo objeto y no un estado por sección, porque al
 * guardar se manda una sola vez: la pantalla se **recorre** por secciones, pero es
 * una sola ficha. Ese es también el motivo por el que la validación vive acá y no
 * en cada sección: el botón de guardar está en la cabecera y tiene que saber si
 * hay un error en una sección que no se está mirando.
 */
export interface TeamMemberDraft {
	firstName: string;
	lastName: string;
	jobTitle: string;
	email: string;
	/** Solo el número nacional. El prefijo va aparte, en `phoneCode`. */
	phone: string;
	phoneCode: string;
	calendarColor: string | null;
	accessRole: StaffAccessRole;
	providesServices: boolean;
	serviceIds: string[];
	commission: string;
	usesCustomSchedule: boolean;
	scheduleDraft: ScheduleDraft;
}

const blankDraft = (): TeamMemberDraft => ({
	firstName: '',
	lastName: '',
	jobTitle: '',
	email: '',
	phone: '',
	phoneCode: DEFAULT_PHONE_CODE,
	calendarColor: null,
	accessRole: 'PROFESSIONAL',
	providesServices: true,
	serviceIds: [],
	commission: '',
	usesCustomSchedule: false,
	scheduleDraft: toScheduleDraft(undefined),
});

const draftFrom = (member: StaffMember): TeamMemberDraft => ({
	// `firstName` cae a `name` para las fichas cargadas antes de que el nombre se
	// partiera en dos, que la migración pudo dejar sin apellido.
	firstName: member.firstName ?? member.name ?? '',
	lastName: member.lastName ?? '',
	jobTitle: member.jobTitle ?? '',
	email: member.email ?? '',
	...splitPhone(member.phone),
	calendarColor: member.calendarColor ?? null,
	accessRole: member.accessRole ?? 'PROFESSIONAL',
	providesServices: member.providesServices ?? true,
	serviceIds: member.services?.map((service) => service.id) ?? [],
	commission: toCommissionInput(member.commissionRate),
	usesCustomSchedule: member.usesCustomSchedule ?? false,
	scheduleDraft: toScheduleDraft(member.schedules),
});

export type SectionKey = 'profile' | 'services' | 'schedule' | 'commission';

export interface DraftIssues {
	/** Impiden guardar. */
	errors: Partial<Record<SectionKey, string>>;
	/** No impiden nada: es lo que conviene saber antes de guardar. */
	warnings: Partial<Record<SectionKey, string[]>>;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const useTeamMemberDraft = (member?: StaffMember | null) => {
	const [draft, setDraft] = useState<TeamMemberDraft>(() =>
		member ? draftFrom(member) : blankDraft(),
	);

	const { data: settings } = useGetSettings();

	const set = <K extends keyof TeamMemberDraft>(
		key: K,
		value: TeamMemberDraft[K],
	) => setDraft((previous) => ({ ...previous, [key]: value }));

	/**
	 * Cambiar el rol mueve `providesServices` a lo que ese rol sugiere.
	 *
	 * Solo como punto de partida: el interruptor de "también atiende clientes"
	 * queda a la vista para volver a prenderlo. Sin esto, elegir "Administrador"
	 * dejaría a la persona reservable, que es justo lo que el rol dice que no.
	 */
	const setRole = (accessRole: StaffAccessRole) =>
		setDraft((previous) => ({
			...previous,
			accessRole,
			providesServices: providesServicesByDefault(accessRole),
		}));

	/**
	 * Al encender la jornada propia por primera vez se parte del horario del
	 * negocio, que es lo que la persona venía haciendo hasta ese momento.
	 */
	const setUsesCustomSchedule = (next: boolean) =>
		setDraft((previous) => ({
			...previous,
			usesCustomSchedule: next,
			scheduleDraft:
				next && fromScheduleDraft(previous.scheduleDraft).length === 0
					? buildDefaultDraft(settings?.businessHours)
					: previous.scheduleDraft,
		}));

	// Vacío significa "sin comisión configurada", que no es lo mismo que 0%.
	const commissionRate =
		draft.commission.trim() === '' ? null : Number(draft.commission);

	const issues = useMemo<DraftIssues>(() => {
		const errors: DraftIssues['errors'] = {};
		const warnings: DraftIssues['warnings'] = {};

		if (!draft.firstName.trim()) {
			errors.profile = 'Falta el nombre.';
		} else if (draft.email.trim() && !EMAIL_PATTERN.test(draft.email.trim())) {
			errors.profile = 'El email no tiene un formato válido.';
		}

		if (
			commissionRate !== null &&
			(!Number.isFinite(commissionRate) ||
				commissionRate < 0 ||
				commissionRate > 100)
		) {
			errors.commission = 'La comisión debe ser un porcentaje entre 0 y 100.';
		}

		if (draft.usesCustomSchedule) {
			const scheduleError = validateScheduleDraft(
				draft.scheduleDraft,
				'Marcá al menos un día de trabajo, o apagá la jornada propia para usar el horario del negocio.',
			);
			if (scheduleError) errors.schedule = scheduleError;

			const businessWarnings = findBusinessHoursWarnings(
				draft.scheduleDraft,
				settings?.businessHours,
			);
			if (businessWarnings.length) warnings.schedule = businessWarnings;
		}

		/*
		 * Atiende pero no tiene servicios: se guarda igual y se avisa.
		 *
		 * No es un error —el negocio puede estar cargando la ficha antes que el
		 * catálogo—, pero es la razón por la que después no va a aparecer en ninguna
		 * reserva, y eso tiene que verse antes de guardar y no descubrirse al
		 * intentar agendar.
		 */
		if (draft.providesServices && draft.serviceIds.length === 0) {
			warnings.services = [
				'Sin servicios asignados no va a poder recibir reservas.',
			];
		}

		return { errors, warnings };
	}, [draft, commissionRate, settings?.businessHours]);

	const canSave = Object.keys(issues.errors).length === 0;

	const toPayload = (): TeamMemberPayload => ({
		firstName: draft.firstName.trim(),
		lastName: draft.lastName.trim() || undefined,
		jobTitle: draft.jobTitle.trim() || undefined,
		email: draft.email.trim() || undefined,
		phone: joinPhone(draft.phoneCode, draft.phone),
		calendarColor: draft.calendarColor ?? undefined,
		accessRole: draft.accessRole,
		providesServices: draft.providesServices,
		serviceIds: draft.serviceIds,
		commissionRate,
		usesCustomSchedule: draft.usesCustomSchedule,
		// Con la jornada apagada no se mandan franjas: el backend conserva las
		// guardadas por si el negocio vuelve a encenderla.
		schedules: draft.usesCustomSchedule
			? fromScheduleDraft(draft.scheduleDraft)
			: undefined,
	});

	return {
		draft,
		set,
		setRole,
		setUsesCustomSchedule,
		issues,
		canSave,
		toPayload,
	};
};

export default useTeamMemberDraft;
