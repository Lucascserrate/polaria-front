export type TenantStatus = 'active' | 'inactive';

/** Las coordenadas del local. Van juntas: una sola no ubica nada. */
export interface TenantLocation {
	latitude: number;
	longitude: number;
}

export interface Tenant {
	id: string;
	name: string;
	businessType?: string;
	/**
	 * Dirección en texto, la que se lee en la página pública. No reemplaza a las
	 * coordenadas: una se lee, la otra se abre en un mapa.
	 */
	address?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	/**
	 * `null` mientras el negocio no conectó WhatsApp. Lo escribe el Embedded
	 * Signup, nunca esta herramienta.
	 */
	whatsappPhoneNumber: string | null;
	whatsappPhoneId?: string | null;
	whatsappAccessToken?: string | null;
	whatsappVerifiedName?: string | null;
	whatsappConnectedAt?: string | null;
	/**
	 * Desde cuándo Meta informa que la conexión se cayó. Es un tercer estado, no
	 * lo mismo que estar sin conectar: las credenciales siguen guardadas.
	 */
	whatsappUnavailableSince?: string | null;
	whatsappUnavailableReason?: string | null;
	timezone: string;
	email?: string;
	googleId?: string;
	status?: TenantStatus;
	aiEnabled: boolean;
	googleRefreshToken?: string;
	googleAccessToken?: string;
	calendarId?: string;
	createdAt: string;
	updatedAt: string;
}

/**
 * Lo mínimo para que el negocio exista.
 *
 * Sin teléfono a propósito: el número lo trae el Embedded Signup cuando el
 * negocio conecta WhatsApp. Pedirlo acá sería pedir un dato que soporte no tiene
 * y que, si se inventa, queda ocupando el índice único del número real.
 */
export interface CreateTenantDto {
	name: string;
	email: string;
	timezone?: string;
}

export interface UpdateTenantDto {
	name?: string;
	businessType?: string;
	address?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	email?: string;
	timezone?: string;
	status?: TenantStatus;
	aiEnabled?: boolean;
}

/**
 * El estado de la prueba gratuita de un negocio, ya resuelto por el backend.
 *
 * `state` llega derivado y no crudo a propósito: `TRIAL` guardado puede ser una
 * prueba en curso o una vencida según la hora, y hacer esa cuenta acá sería una
 * segunda copia de la regla que decide el acceso.
 */
export interface TrialSummary {
	/** `NOT_STARTED` | `TRIAL_ACTIVE` | `TRIAL_EXPIRED` | `ACTIVE` | `EXPIRED` | `CANCELED`. */
	state: string;
	/** Días completos que faltan. Sólo con la prueba en curso. */
	daysRemaining: number | null;
	trialStartedAt: string | null;
	trialEndsAt: string | null;
	/** Si extenderle la prueba a este negocio tiene sentido. Lo decide el backend. */
	canExtend: boolean;
	/**
	 * Las extensiones que se ofrecen, con el vencimiento al que llevaría cada una.
	 *
	 * La fecha proyectada la calcula el backend con la misma función que después
	 * la aplica. Hacerla acá sería copiar la regla —"se suma al vencimiento
	 * vigente, salvo que ya haya vencido"—, que es justo lo que diverge sin que
	 * nadie se entere. Vacío cuando no se puede extender.
	 */
	options: Array<{ days: number; trialEndsAt: string }>;
}
