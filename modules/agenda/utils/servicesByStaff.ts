import { eligibleStaffFor, type StaffOption } from './eligibleStaff';

export interface ServicesSplit<S> {
	/** Los que hace el profesional de la columna. */
	own: S[];
	/** Los que hace algún otro. */
	rest: S[];
}

/**
 * Parte el catálogo en lo que hace un profesional y lo que no.
 *
 * Nace de la agenda por día, donde cada columna es de alguien: al abrir una
 * reserva desde la columna de Ana, la lista ofrecía el catálogo entero. Elegir
 * ahí un servicio que Ana no hace reasignaba la cita a otra persona en silencio
 * —lo correcto, porque Ana no puede hacerlo, pero sin avisar—, y el negocio
 * terminaba con una cita de alguien que no era con quien creía estar agendando.
 *
 * Parte y no filtra. Esconder lo que Ana no hace haría creer que el servicio no
 * existe, y desde el mostrador se agenda lo que el cliente pide, no lo que la
 * columna permite: lo que faltaba no era sacar opciones sino decir cuáles son de
 * quién.
 *
 * Sin profesional preferido —la reserva que arranca del botón de la barra, sin
 * columna— no hay nada que partir y todo cae en `rest`, que es la lista de
 * siempre.
 */
export const splitServicesByStaff = <
	S extends { id: string },
	T extends StaffOption,
>(
	services: S[],
	staff: T[],
	preferredStaffId: string | null | undefined,
): ServicesSplit<S> => {
	if (!preferredStaffId) return { own: [], rest: services };

	const own: S[] = [];
	const rest: S[] = [];

	for (const service of services) {
		const does = eligibleStaffFor(staff, service.id).some(
			(member) => member.id === preferredStaffId,
		);

		(does ? own : rest).push(service);
	}

	return { own, rest };
};
