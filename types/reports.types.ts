import type { AppointmentStatus } from '@/types/appointments.types';

export const REPORT_PRESETS = ['today', 'week', 'month', 'custom'] as const;
export type ReportPreset = (typeof REPORT_PRESETS)[number];

export interface ReportSummary {
	revenueTotal: number;
	completedCount: number;
	cancelledCount: number;
	/** Citas aún abiertas: pendientes, agendadas o confirmadas. */
	pendingCount: number;
	averageTicket: number;
	byStatus: Record<AppointmentStatus, number>;
}

export interface StaffRankingEntry {
	staffId: string;
	staffName: string;
	completedAppointments: number;
	revenue: number;
	/** Porcentaje configurado, o `null` si el negocio no definió comisión. */
	commissionRate: number | null;
	estimatedCommission: number | null;
	/** `true` si el profesional ya no trabaja en el negocio. */
	isFormer: boolean;
}

export interface ServiceRankingEntry {
	serviceId: string;
	serviceName: string;
	timesPerformed: number;
	revenue: number;
}

export type TimelineGranularity = 'day' | 'month';

export interface TimelineBucket {
	/** `YYYY-MM-DD` por día, `YYYY-MM` por mes. */
	key: string;
	revenue: number;
	/** Citas distintas atendidas en el tramo, no servicios prestados. */
	completed: number;
}

export interface ReportTimeline {
	granularity: TimelineGranularity;
	buckets: TimelineBucket[];
}

export interface TenantReport {
	range: {
		preset: ReportPreset;
		from: string;
		to: string;
		timezone: string;
	};
	/** ISO 4217, para formatear los montos. */
	currency: string;
	summary: ReportSummary;
	/**
	 * Cómo evolucionó la facturación dentro del período.
	 *
	 * `null` cuando el rango es de un solo día: una sola barra no compara nada.
	 */
	timeline: ReportTimeline | null;
	staffRanking: StaffRankingEntry[];
	serviceRanking: ServiceRankingEntry[];
}

export interface ReportQuery {
	preset?: ReportPreset;
	from?: string;
	to?: string;
}

/**
 * Lo que se le informa a un profesional sobre su propio trabajo.
 *
 * No es `TenantReport` recortado: el grano es otro. Los números del negocio se
 * cuentan por cita; los de una persona, por segmento, porque una cita puede
 * repartirse entre dos profesionales y a cada uno le corresponde lo suyo.
 *
 * Tampoco lleva `staffRanking`: comparar a alguien con sus compañeros es
 * exactamente lo que no le toca ver.
 */
export interface StaffReport {
	range: {
		preset: ReportPreset;
		from: string;
		to: string;
		timezone: string;
	};
	currency: string;
	staff: {
		id: string;
		name: string;
		/**
		 * Su porcentaje sobre lo que factura, o `null` si el negocio no configuró
		 * comisión. Ya viene parseado: acá no hace falta `parseCommissionRate`.
		 *
		 * Va en `staff` y no en `summary` porque no es un resultado del período sino
		 * una condición del profesional, y vale igual para el período anterior.
		 */
		commissionRate: number | null;
	};
	/** Facturado hoy, en la semana y en el mes, al margen del período elegido. */
	revenueSnapshots: {
		today: number;
		week: number;
		month: number;
	};
	summary: StaffSummary;
	/**
	 * El mismo resumen, del período inmediatamente anterior.
	 *
	 * Lo que convierte un número en información: "Bs 200" no dice nada, "Bs 200,
	 * 12% más que el mes pasado" sí. Lo resuelve el backend porque qué días son "el
	 * período anterior" depende del calendario del negocio, no del reloj del
	 * navegador —y un mes se compara contra el mes anterior completo, no contra 31
	 * días atrás—.
	 */
	comparison: {
		/** Qué días fueron, para poder nombrar la comparación ("vs. julio"). */
		range: { from: string; to: string };
		summary: StaffSummary;
	};
	timeline: ReportTimeline | null;
	serviceRanking: ServiceRankingEntry[];
}

/** Los números de un profesional en un período. El reporte lo usa dos veces. */
export interface StaffSummary {
	revenueTotal: number;
	/**
	 * Lo que le corresponde de `revenueTotal`, o `null` si el negocio no configuró
	 * comisión —distinto de una comisión de cero, que sí se muestra—.
	 *
	 * Es **estimado** y hay que escribirlo así en pantalla: sale de la tasa vigente
	 * hoy, no de la que regía el día de cada servicio, y no hay registro de pagos,
	 * así que no sabe nada de lo que el negocio ya liquidó.
	 */
	estimatedCommission: number | null;
	completedCount: number;
	cancelledCount: number;
	pendingCount: number;
	/** Personas distintas atendidas. Un cliente que volvió tres veces cuenta una. */
	clientsServed: number;
	/** Servicios prestados. Acá el grano es el segmento: son unidades de trabajo. */
	servicesPerformed: number;
	averageTicket: number;
}
