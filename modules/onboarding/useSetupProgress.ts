import useGetOnboardingStatus from '@/services/onboarding/useGetOnboardingStatus';
import { SETUP_STEP_COUNT } from '@/modules/onboarding/PolariaSetupChecklist';

export interface SetupProgress {
	/** Si todavía queda algo por configurar. Con `false`, "Empezar" no existe. */
	pending: boolean;
	completed: number;
	total: number;
}

/**
 * Cuánto le falta al negocio para terminar de configurarse.
 *
 * Lo consultan el menú lateral y la barra de abajo, que dibujan la misma entrada
 * en dos formas. La consulta es una sola —comparten clave de react-query— y lo
 * que se comparte de verdad es la definición de "pendiente", que es lo que se
 * podía desincronizar.
 *
 * Es del negocio, no de la persona: un profesional no tiene nada que configurar
 * y el endpoint le responde 403, así que se pide sólo cuando corresponde.
 */
export const useSetupProgress = (enabled: boolean): SetupProgress => {
	const { data } = useGetOnboardingStatus(enabled);

	return {
		pending: Boolean(data && data.nextStep !== null),
		completed: data ? Object.values(data.steps).filter(Boolean).length : 0,
		total: SETUP_STEP_COUNT,
	};
};
