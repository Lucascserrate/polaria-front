import { useQuery } from '@tanstack/react-query';
import { AGENDA_REFETCH_MS } from '@/modules/staff/constants';
import {
	getScheduleBlocksRange,
	scheduleBlockKeys,
} from './schedule-blocks.service';

/**
 * Los bloqueos de un rango de días.
 *
 * Mismo ritmo de refresco que las citas: la agenda se mira abierta durante todo
 * el día, y un bloqueo que otro puso hace media hora tiene que aparecer sin
 * recargar.
 *
 * @param from `YYYY-MM-DD` en la zona del negocio.
 * @param to Igual, inclusive.
 */
const useGetScheduleBlocksRange = (from: string, to: string) =>
	useQuery({
		queryKey: scheduleBlockKeys.range(from, to),
		queryFn: () => getScheduleBlocksRange(from, to),
		refetchInterval: AGENDA_REFETCH_MS,
		/*
		 * Al navegar a otra semana se sigue mostrando la anterior mientras llega la
		 * nueva, igual que con las citas: sin esto los bloqueos parpadean vacíos en
		 * cada flecha y se lee como que se borraron.
		 */
		placeholderData: (previous) => previous,
	});

export default useGetScheduleBlocksRange;
