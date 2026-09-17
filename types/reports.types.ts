import type { AppointmentStatus } from '@/types/appointments.types';
import type { MoneyTotal } from '@/lib/money';

export const REPORT_PRESETS = ['today', 'week', 'month', 'custom'] as const;
export type ReportPreset = (typeof REPORT_PRESETS)[number];

/**
 * Lo facturado en una moneda. Espejo de `CurrencyRevenue` del servidor.
 *
 * Los totales son listas porque un catálogo puede cobrar en dos monedas, y
 * sumarlas daría un número que no se le puede cobrar a nadie. Casi todos los
 * negocios usan una sola y reciben una lista de un elemento.
 */
export interface CurrencyRevenue {
	currency: string;
	amount: number;
	/** Promedio por cita facturada **en esta moneda**. */
	averageTicket: number;
}

/** Lo facturado en una moneda, más la parte del profesional. */
export interface CurrencyEarnings extends CurrencyRevenue {
	/** `null` si el negocio no definió comisión, distinto de una comisión cero. */
	estimatedCommission: number | null;
}

export interface ReportSummary {
	/** Lo facturado, una entrada por moneda. */
	revenue: CurrencyRevenue[];
	completedCount: number;
	cancelledCount: number;
	/** Citas aún abiertas: pendientes, agendadas o confirmadas. */
	pendingCount: number;
	byStatus: Record<AppointmentStatus, number>;
}

export interface StaffRankingEntry {
	staffId: string;
	staffName: string;
	completedAppointments: number;
	/** Lo facturado y su parte, una entrada por moneda. */
	earnings: CurrencyEarnings[];
	/** Porcentaje configurado, o `null` si el negocio no definió comisión. */
	commissionRate: number | null;
	/** `true` si el profesional ya no trabaja en el negocio. */
	isFormer: boolean;
}

export interface ServiceRankingEntry {
	serviceId: string;
	serviceName: string;
	timesPerformed: number;
	revenue: number;
	/** La moneda de `revenue`: un servicio cobra en una sola. */
	currency: string;
}

export type TimelineGranularity = 'day' | 'month';

export interface TimelineBucket {
	/** `YYYY-MM-DD` por día, `YYYY-MM` por mes. */
	key: string;
	/** Lo facturado en el tramo, una entrada por moneda. Vacío si no facturó. */
	revenue: MoneyTotal[];
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
	/**
	 * Moneda por defecto del negocio, en ISO 4217.
	 *
	 * No es la moneda de los montos —cada uno trae la suya— sino con cuál escribir
	 * un cero: un período sin facturación no tiene moneda propia.
	 */
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
	/**
	 * Lo generado en el mes en curso, al margen del período elegido.
	 *
	 * La única cifra que no sigue al selector, y está por una razón concreta: quien
	 * mira "hoy" a media mañana ve un cero, y necesita el mes al lado para saber que
	 * mira una jornada que empieza y no una pantalla rota. Antes eran tres —hoy,
	 * semana y mes—, que son las tres opciones del selector.
	 */
	currentMonth: {
		/** Lo generado y su parte, una entrada por moneda. */
		earnings: CurrencyEarnings[];
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
	/**
	 * Lo que facturó y lo que le corresponde, una entrada por moneda.
	 *
	 * La comisión es **estimada** y hay que escribirla así en pantalla: sale de la
	 * tasa vigente hoy, no de la que regía el día de cada servicio, y no hay
	 * registro de pagos, así que no sabe nada de lo que el negocio ya liquidó.
	 */
	earnings: CurrencyEarnings[];
	completedCount: number;
	cancelledCount: number;
	pendingCount: number;
	/** Personas distintas atendidas. Un cliente que volvió tres veces cuenta una. */
	clientsServed: number;
	/** Servicios prestados. Acá el grano es el segmento: son unidades de trabajo. */
	servicesPerformed: number;
}
