export type TenantStatus = 'active' | 'inactive';

export interface TenantSubscription {
	/** `NOT_STARTED` | `TRIAL_ACTIVE` | `TRIAL_EXPIRED` | `ACTIVE` | `EXPIRED` | `CANCELED`. */
	state: string;
	daysRemaining: number | null;
	trialEndsAt: string | null;
	subscriptionEndsAt: string | null;
}

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
 * Un negocio tal como viene del listado de soporte.
 *
 * Tipo aparte y no un campo opcional en `Tenant`: la suscripción la arma el
 * listado, y el alta, la edición y la ficha devuelven el negocio sin ella.
 * Declararla opcional en todos obligaría a cada consumidor a contemplar un
 * `undefined` que en el listado no ocurre nunca.
 */
export interface TenantListItem extends Tenant {
	subscription: TenantSubscription;
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
	businessType?: string | null;
	address?: string | null;
	latitude?: number | null;
	longitude?: number | null;
	email?: string | null;
	timezone?: string;
	status?: TenantStatus;
	aiEnabled?: boolean;
}

/**
 * El estado comercial de un negocio, ya resuelto por el backend.
 *
 * Uno solo para la prueba y para la suscripción paga: son dos tramos del mismo
 * recorrido —se prueba, se paga, se renueva— y el negocio está en uno por vez.
 *
 * `state` llega derivado y no crudo a propósito: `TRIAL` o `ACTIVE` guardados
 * pueden ser algo en curso o algo vencido según la hora, y hacer esa cuenta acá
 * sería una segunda copia de la regla que decide el acceso.
 */
export interface SubscriptionSummary {
	/** `NOT_STARTED` | `TRIAL_ACTIVE` | `TRIAL_EXPIRED` | `ACTIVE` | `EXPIRED` | `CANCELED`. */
	state: string;
	/** Días completos que faltan: de la prueba en curso o de lo que está pago. */
	daysRemaining: number | null;
	trialStartedAt: string | null;
	trialEndsAt: string | null;
	/** Hasta cuándo está paga la suscripción. `null` si nunca pagó. */
	subscriptionEndsAt: string | null;
	/** Si extenderle la prueba a este negocio tiene sentido. Lo decide el backend. */
	canExtendTrial: boolean;
	/**
	 * Las extensiones de prueba que se ofrecen, con el vencimiento al que
	 * llevaría cada una.
	 *
	 * La fecha proyectada la calcula el backend con la misma función que después
	 * la aplica. Hacerla acá sería copiar la regla —"se suma al vencimiento
	 * vigente, salvo que ya haya vencido"—, que es justo lo que diverge sin que
	 * nadie se entere. Vacío cuando no se puede extender.
	 */
	trialOptions: Array<{ days: number; trialEndsAt: string }>;
	/**
	 * Los plazos que se pueden cobrar, con la fecha hasta la que cubriría cada
	 * uno. Proyectados por el backend por lo mismo que los de la prueba: la
	 * cuenta de los meses de calendario no puede tener una segunda
	 * implementación acá.
	 */
	paymentOptions: Array<{ months: number; subscriptionEndsAt: string }>;
}
