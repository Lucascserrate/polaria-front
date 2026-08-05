import type { ServiceSummary } from '@/types/service.types';

export interface StaffMember {
	id: string;
	name: string;
	email?: string;
	isActive: boolean;
	/**
	 * Porcentaje sobre lo que factura (0-100). `null` cuando el negocio no
	 * configuró comisión. Llega como string desde el backend: leerlo con los
	 * helpers de `modules/staff/utils/commission`.
	 */
	commissionRate?: number | string | null;
	services?: ServiceSummary[];
}

export interface CreateStaffDto {
	name: string;
	email?: string;
	isActive?: boolean;
	calendarId?: string;
	commissionRate?: number | null;
	serviceIds?: string[];
}

export interface UpdateStaffDto {
	name?: string;
	email?: string;
	isActive?: boolean;
	calendarId?: string;
	commissionRate?: number | null;
	serviceIds?: string[];
}

/** Lo que produce `StaffForm`: siempre completo, nunca parcial. */
export interface StaffFormPayload {
	name: string;
	serviceIds: string[];
	commissionRate: number | null;
}
