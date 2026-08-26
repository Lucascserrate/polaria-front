import { useQuery } from '@tanstack/react-query';
import { getOnboardingStatus, ONBOARDING_KEY } from './onboarding.service';

/**
 * Estado de configuración del negocio.
 *
 * Decide a dónde entra el usuario después de autenticarse, así que no se cachea
 * de más: completar un paso tiene que reflejarse sin recargar la página.
 *
 * @param enabled Para no pedirlo cuando quien mira no puede configurar nada. El
 * endpoint es de administración y a un profesional le responde 403: sin esto, cada
 * pantalla suya arrancaría con una petición condenada a fallar.
 */
const useGetOnboardingStatus = (enabled = true) => {
	return useQuery({
		queryKey: ONBOARDING_KEY,
		queryFn: getOnboardingStatus,
		staleTime: 0,
		enabled,
	});
};

export default useGetOnboardingStatus;
