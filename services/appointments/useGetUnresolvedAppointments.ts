import { useQuery } from '@tanstack/react-query';
import {
	AGENDA_REFETCH_MS,
	unresolvedAppointmentsKey,
} from '@/modules/staff/constants';
import { mapAppointment } from '@/modules/appointments/utils/mapAppointment';
import {
	getUnresolvedAppointments,
	type UnresolvedAppointments,
} from './appointments.service';

/**
 * Se define fuera del hook a propósito: React Query memoiza `select` por
 * identidad de la función, y una lambda inline recalcularía el mapeo en cada
 * render.
 */
const toQueue = (data: UnresolvedAppointments) => ({
	...data,
	items: data.items.map(mapAppointment),
});

/**
 * Las citas de días cerrados que siguen sin resolverse.
 *
 * Solo la puede pedir un administrador —cerrar una cita es cambiarle el estado, y
 * eso hoy es del negocio—, así que en la agenda de un profesional el endpoint
 * responde 403. Por eso `enabled`: sin él, cada refetch dejaría un error en la
 * consola de alguien que no tiene nada que arreglar.
 *
 * @param limit Cuántas traer para dibujar. El total viene igual completo.
 */
const useGetUnresolvedAppointments = (limit: number, enabled = true) =>
	useQuery({
		queryKey: unresolvedAppointmentsKey(limit),
		queryFn: () => getUnresolvedAppointments(limit),
		select: toQueue,
		enabled,
		refetchInterval: AGENDA_REFETCH_MS,
	});

export default useGetUnresolvedAppointments;
