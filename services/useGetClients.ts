import { useQuery } from '@tanstack/react-query';
import { getClients } from './clients';

/**
 * Los clientes del negocio, para poder elegir uno al crear una reserva.
 *
 * Cachea largo: la lista cambia cuando se carga un cliente nuevo, y eso lo hace
 * esta misma pantalla. Sirve sobre todo para no crear tres veces al mismo
 * "Ana" — sin teléfono, el backend no puede reconocerla.
 */
const useGetClients = () => {
	return useQuery({
		queryKey: ['clients'],
		queryFn: getClients,
		staleTime: 5 * 60 * 1000,
	});
};

export default useGetClients;
