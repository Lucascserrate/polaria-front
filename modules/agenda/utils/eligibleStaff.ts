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
	services?: Array<{ id: string }>;
}

/**
 * Profesionales que pueden hacer un servicio.
 *
 * Es el mismo criterio que aplica el backend al calcular disponibilidad —activo
 * y con el servicio asignado—, así que la lista no ofrece a nadie que después
 * vaya a devolver cero horarios.
 */
export const eligibleStaffFor = <T extends StaffOption>(
	staff: T[],
	serviceId: string | null,
): T[] => {
	if (!serviceId) return [];

	return staff.filter(
		(member) =>
			member.isActive &&
			(member.services ?? []).some((service) => service.id === serviceId),
	);
};
