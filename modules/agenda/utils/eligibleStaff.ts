/**
 * Quién puede hacer un servicio.
 *
 * Vivía en el wizard de creación; se mudó acá cuando el wizard desapareció y el
 * drawer quedó como único formulario de reservas. La forma que pide del staff es
 * estructural a propósito: la satisface lo que devuelve el catálogo sin
 * conversión, y a la vez no ata esta regla a ese endpoint.
 */

export interface StaffOption {
	id: string;
	name: string;
	isActive: boolean;
	/**
	 * Si atiende clientes. Opcional porque los datos viejos no lo traían, y
	 * ausente significa que sí: es como quedó el equipo tras la migración.
	 */
	providesServices?: boolean;
	services?: Array<{ id: string }>;
}

/**
 * Profesionales que pueden hacer un servicio.
 *
 * Es el mismo criterio que aplica el backend —`BOOKABLE_STAFF_WHERE` más tener el
 * servicio asignado—, así que la lista no ofrece a nadie que después vaya a
 * devolver cero horarios ni a quien el guardado va a rechazar.
 *
 * Que atienda clientes se mira acá **además** de en el backend, no en su lugar: el
 * equipo llega completo desde `/staff` porque la pantalla de Equipo necesita
 * listar también a los administradores, así que sin este filtro un administrativo
 * con servicios cargados aparecería entre los profesionales de una reserva. El
 * backend lo rechazaría al guardar, pero recién después de haberlo ofrecido.
 */
export const eligibleStaffFor = <T extends StaffOption>(
	staff: T[],
	serviceId: string | null,
): T[] => {
	if (!serviceId) return [];

	return staff.filter(
		(member) =>
			member.isActive &&
			(member.providesServices ?? true) &&
			(member.services ?? []).some((service) => service.id === serviceId),
	);
};
