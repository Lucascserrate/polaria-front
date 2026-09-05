/**
 * Quién puede poner el servicio en la agenda.
 *
 * Espejo de `ServiceBookingPolicy` del servidor. `CONSULTATION_FIRST` no lo saca
 * del catálogo —se sigue cotizando y el asistente lo explica—: lo saca de las
 * opciones que el cliente elige, para que lo agende el negocio después de verlo.
 */
export type ServiceBookingPolicy = 'CLIENT_BOOKS' | 'CONSULTATION_FIRST';

export interface Service {
	id: string;
	name: string;
	description?: string;
	durationMinutes: number;
	price: number;
	timezone?: string;
	isActive?: boolean;
	/** Ausente en servicios creados antes de que esto existiera: son reservables. */
	bookingPolicy?: ServiceBookingPolicy;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateServiceDto {
	name: string;
	description?: string;
	durationMinutes: number;
	price: number;
	timezone: string;
	isActive?: boolean;
	bookingPolicy?: ServiceBookingPolicy;
}

export type UpdateServiceDto = Partial<CreateServiceDto>;

export type UpdateServiceInput = {
	id: string;
	data: UpdateServiceDto;
};

export type ServiceSummary = Pick<Service, 'id' | 'name' | 'isActive'>;
