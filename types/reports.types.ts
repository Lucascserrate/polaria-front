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
