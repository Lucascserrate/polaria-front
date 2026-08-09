import type { ServiceSummary } from '@/types/service.types';

/** Franja tal como la devuelve el backend: las horas llegan como `HH:MM:SS`. */
export interface StaffScheduleApi {
	/** 0 = domingo, igual que en el backend. */
	dayOfWeek: number;
	startTime: string;
	endTime: string;
}

/** Franja tal como la manda el formulario: horas en `HH:MM`. */
export interface StaffScheduleInput {
	dayOfWeek: number;
	startTime: string;
	endTime: string;
}

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
	/** Si es `false`, atiende en el horario del negocio y `schedules` se ignora. */
	usesCustomSchedule?: boolean;
	schedules?: StaffScheduleApi[];
	services?: ServiceSummary[];
}

export interface CreateStaffDto {
	name: string;
	email?: string;
	isActive?: boolean;
	calendarId?: string;
	commissionRate?: number | null;
	usesCustomSchedule?: boolean;
	serviceIds?: string[];
	schedules?: StaffScheduleInput[];
}

export interface UpdateStaffDto {
	name?: string;
	email?: string;
	isActive?: boolean;
	calendarId?: string;
	commissionRate?: number | null;
	usesCustomSchedule?: boolean;
	serviceIds?: string[];
	schedules?: StaffScheduleInput[];
}

/** Lo que produce `StaffForm`: siempre completo, nunca parcial. */
export interface StaffFormPayload {
	name: string;
	serviceIds: string[];
	commissionRate: number | null;
	usesCustomSchedule: boolean;
	/**
	 * Ausente cuando la jornada propia está apagada: así el backend conserva las
	 * franjas guardadas por si el negocio vuelve a encenderla.
	 */
	schedules?: StaffScheduleInput[];
}
