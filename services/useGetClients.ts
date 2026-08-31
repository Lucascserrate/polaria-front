import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getClients, type ClientsQuery } from './clients';

/**
 * Una página de clientes del negocio.
 *
 * El buscador viaja al servidor, así que cada término es su propia consulta.
 * `keepPreviousData` es lo que evita que la lista se vacíe entre una letra y la
 * siguiente: se sigue viendo el resultado anterior mientras llega el nuevo, en
 * vez de un parpadeo a "sin resultados" en cada tecla.
 */
const useGetClients = (query: ClientsQuery = {}, options?: { enabled?: boolean }) => {
	return useQuery({
		queryKey: ['clients', query],
		queryFn: () => getClients(query),
		placeholderData: keepPreviousData,
		staleTime: 60 * 1000,
		enabled: options?.enabled ?? true,
	});
};

export default useGetClients;
