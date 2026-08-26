import type { ServiceSummary } from '@/types/services.types';

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

/**
 * Qué puede hacer un miembro del equipo dentro de Polaria.
 *
 * No dice si atiende clientes: eso es `providesServices`, y son dos preguntas
 * distintas a propósito. Un dueño que además corta pelo es `OWNER` con
 * `providesServices` en `true`.
 */
export type StaffAccessRole = 'OWNER' | 'ADMIN' | 'PROFESSIONAL';

export interface StaffMember {
	id: string;
	/** Nombre para mostrar. Lo deriva el backend de `firstName` y `lastName`. */
	name: string;
	firstName: string;
	lastName?: string | null;
	jobTitle?: string | null;
	calendarColor?: string | null;
	accessRole?: StaffAccessRole;
	/** Junto con `isActive`, lo único que lo hace reservable. */
	providesServices?: boolean;
	/**
	 * Con qué correo entra a Polaria. `null` significa que no tiene acceso.
	 *
	 * Distinto de `email`, que es de contacto: corregir un typo en el correo de
	 * contacto no puede cambiar con qué cuenta inicia sesión.
	 */
	accessEmail?: string | null;
	/** Presente cuando ya entró al menos una vez. Sin esto, la invitación está pendiente. */
	accessGoogleId?: string | null;
	accessGrantedAt?: string | null;
	email?: string;
	phone?: string | null;
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
	/**
	 * Segmentos de cita que tiene, de cualquier estado.
	 *
	 * Sirve para anticipar el efecto de eliminarlo: con historial, la eliminación
	 * es una baja que lo conserva; sin historial, es definitiva.
	 */
	appointmentCount?: number;
	/** Citas que todavía ocupan agenda y están por delante. Bloquean la eliminación. */
	futureAppointmentCount?: number;
}

export interface CreateStaffDto {
	firstName: string;
	lastName?: string;
	jobTitle?: string;
	calendarColor?: string;
	accessRole?: StaffAccessRole;
	providesServices?: boolean;
	email?: string;
	phone?: string;
	isActive?: boolean;
	calendarId?: string;
	commissionRate?: number | null;
	usesCustomSchedule?: boolean;
	serviceIds?: string[];
	schedules?: StaffScheduleInput[];
}

export type UpdateStaffDto = Partial<CreateStaffDto>;

/**
 * Lo que produce el editor de equipo: siempre completo, nunca parcial.
 *
 * Completo y no parcial porque el editor es una pantalla, no un patch: al guardar
 * se manda el estado entero de lo que se estaba viendo. Un parcial obligaría a
 * rastrear qué campo se tocó, que es contabilidad sin lector.
 */
export interface TeamMemberPayload {
	firstName: string;
	lastName?: string;
	jobTitle?: string;
	email?: string;
	phone?: string;
	calendarColor?: string;
	accessRole: StaffAccessRole;
	providesServices: boolean;
	serviceIds: string[];
	commissionRate: number | null;
	usesCustomSchedule: boolean;
	/**
	 * Ausente cuando la jornada propia está apagada: así el backend conserva las
	 * franjas guardadas por si el negocio vuelve a encenderla.
	 */
	schedules?: StaffScheduleInput[];
}

export interface WorkingStaffResponse {
	date: string;
	timezone: string;
	staff: Array<{
		id: string;
		name: string;
		ranges: Array<{ from: string; to: string }>;
	}>;
}
