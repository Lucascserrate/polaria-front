/**
 * Formas mínimas que los pasos necesitan de cada catálogo.
 *
 * Son estructurales a propósito: `ServiceApi` y `StaffMember` las satisfacen sin
 * conversión, y a la vez los pasos no quedan atados a esos tipos ni a los
 * endpoints que los traen.
 */

export interface ServiceOption {
	id: string;
	name: string;
	durationMinutes: number;
}

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
 * vaya a devolver cero horarios. Vale igual para una reserva futura que para
 * registrar algo que ya ocurrió, y por eso vive acá y no en un contexto.
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

/** Opción de una lista de pasos: el borde marca la elegida. */
export const selectableClass = (selected: boolean) =>
	[
		'w-full rounded-md border p-3 text-left transition-colors hover:bg-accent',
		selected ? 'border-primary' : 'border-border',
	].join(' ');
