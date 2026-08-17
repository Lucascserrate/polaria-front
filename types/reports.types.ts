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
	staffRanking: StaffRankingEntry[];
	serviceRanking: ServiceRankingEntry[];
}

export interface ReportQuery {
	preset?: ReportPreset;
	from?: string;
	to?: string;
}
