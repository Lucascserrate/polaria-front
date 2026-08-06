import isValidEmail from '@/lib/isValidEmail';
import type {
	CreateTenantDto,
	Tenant,
	UpdateTenantDto,
} from '@/types/tenant.types';

export type TenantSubmission = CreateTenantDto | UpdateTenantDto;
export type TenantValidationMode = 'create' | 'edit';

export type TenantValidationResult = {
	valid: boolean;
	error?: string;
};

const getWhatsappPhoneNumber = (payload: TenantSubmission): string | undefined =>
	'whatsappPhoneNumber' in payload ? payload.whatsappPhoneNumber : undefined;

export const validateTenantSubmission = (
	payload: TenantSubmission,
	existingTenants: Tenant[],
	mode: TenantValidationMode,
): TenantValidationResult => {
	const name = payload.name?.trim() ?? '';
	const email = payload.email?.trim() ?? '';
	const whatsappPhoneNumber = getWhatsappPhoneNumber(payload)?.trim() ?? '';

	if (!name) {
		return { valid: false, error: 'El nombre es obligatorio.' };
	}

	if (!email) {
		return { valid: false, error: 'El correo electrónico es obligatorio.' };
	}

	if (!isValidEmail(email)) {
		return { valid: false, error: 'Ingresa un correo válido.' };
	}

	if (mode === 'create') {
		if (!whatsappPhoneNumber) {
			return { valid: false, error: 'El número de WhatsApp es obligatorio.' };
		}

		const duplicateTenant = existingTenants.find(
			(tenant) => tenant.whatsappPhoneNumber === whatsappPhoneNumber,
		);

		if (duplicateTenant) {
			return {
				valid: false,
				error:
					'Ya existe un tenant con ese número de WhatsApp. Usa un número diferente.',
			};
		}
	}

	return { valid: true };
};

export const validateTenantForm = (
	form: { name: string; email: string },
): Record<string, string> => {
	const nextErrors: Record<string, string> = {};

	if (!form.name.trim()) {
		nextErrors.name = 'El nombre es obligatorio.';
	}

	if (!form.email.trim()) {
		nextErrors.email = 'El correo electrónico es obligatorio.';
	} else if (!isValidEmail(form.email)) {
		nextErrors.email = 'Ingresa un correo válido.';
	}

	return nextErrors;
};