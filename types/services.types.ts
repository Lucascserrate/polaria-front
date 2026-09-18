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
	/**
	 * La categoría a la que pertenece, o `null`/ausente si a ninguna.
	 *
	 * Sin categoría es un estado normal y definitivo, no un dato a medio cargar:
	 * es lo que tiene todo servicio creado antes de que las categorías
	 * existieran, y lo que va a seguir teniendo el catálogo chico que no necesita
	 * agruparse. Se muestran juntos al final de la lista.
	 *
	 * Viaja el id y no la categoría entera para que renombrarla no deje el nombre
	 * viejo pegado en la caché de cada servicio. El nombre sale de
	 * `useGetServiceCategories`.
	 */
	categoryId?: string | null;
	durationMinutes: number;
	/**
	 * Cuánto cuesta, o `null` si se cotiza después de ver a la persona.
	 *
	 * `null` no es `0`: uno es "todavía no se sabe" y el otro es "no se cobra".
	 * Donde iría el importe se escribe el aviso; ver `QUOTED_PRICE_LABEL`.
	 */
	price: number | null;
	/**
	 * La moneda de `price`, en ISO 4217.
	 *
	 * Es del servicio y no del negocio: un catálogo puede cobrar una consulta
	 * presencial en bolivianos y una sesión online en dólares.
	 */
	currency: string;
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
	/** `null` lo saca de la categoría que tenía. Ausente la deja como está. */
	categoryId?: string | null;
	durationMinutes: number;
	/** `null` si el servicio se cotiza. Se manda siempre, aunque sea `null`. */
	price: number | null;
	/** Ausente hereda la moneda por defecto del negocio. */
	currency?: string;
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
