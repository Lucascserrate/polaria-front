import { useQuery } from '@tanstack/react-query';
import { getOnboardingStatus } from './onboarding.service';

/**
 * Estado de configuración del negocio.
 *
 * Decide a dónde entra el usuario después de autenticarse, así que no se cachea
 * de más: completar un paso tiene que reflejarse sin recargar la página.
 */
const useGetOnboardingStatus = () => {
	return useQuery({
		queryKey: ['onboarding', 'status'],
		queryFn: getOnboardingStatus,
		staleTime: 0,
	});
};

export default useGetOnboardingStatus;
