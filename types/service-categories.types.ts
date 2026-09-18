/**
 * Un grupo del catálogo: "Cabello", "Uñas", "Barbería".
 *
 * Espejo de `ServiceCategory` del servidor. Un servicio pertenece a una sola, y
 * puede no pertenecer a ninguna: ver `Service.categoryId`.
 */
export interface ServiceCategory {
	id: string;
	name: string;
	description?: string;
	/**
	 * El orden en que se muestran las categorías entre sí.
	 *
	 * Lo decide el negocio, no el alfabeto: es el orden del menú, y ahí lo que
	 * más se pide va primero. Todavía no hay pantalla para cambiarlo; el servidor
	 * ya lo devuelve ordenado, así que el cliente no vuelve a ordenar.
	 */
	position: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateServiceCategoryDto {
	name: string;
	description?: string;
}

export type UpdateServiceCategoryDto = Partial<CreateServiceCategoryDto>;

/** Un lugar arriba o abajo. Espejo de `MoveDirection` del servidor. */
export type MoveDirection = 'UP' | 'DOWN';

export type MoveServiceCategoryInput = {
	id: string;
	direction: MoveDirection;
};

export type UpdateServiceCategoryInput = {
	id: string;
	data: UpdateServiceCategoryDto;
};
