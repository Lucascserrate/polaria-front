import { useQuery } from '@tanstack/react-query';
import { getServices } from './services.service';
import { serviceKeys } from './serviceKeys';
import type { Service, ServiceScope } from '@/types/services.types';

/**
 * El catálogo del negocio.
 *
 * Por defecto solo los activos, que es lo que quiere todo el que va a elegir un
 * servicio. El catálogo del panel pide `all` porque es el único lugar donde un
 * servicio desactivado sirve para algo: verlo y volver a activarlo.
 */
const useGetServices = (scope: ServiceScope = 'active') => {
	return useQuery<Service[]>({
		queryKey: serviceKeys.list(scope),
		queryFn: () => getServices(scope),
	});
};

export default useGetServices;
