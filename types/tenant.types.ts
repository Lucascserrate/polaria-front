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
