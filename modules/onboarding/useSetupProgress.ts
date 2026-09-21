import useGetOnboardingStatus from '@/services/onboarding/useGetOnboardingStatus';
import { LESSONS } from '@/modules/onboarding/tour/lessons';

export interface SetupProgress {
	/** Si todavía queda alguna lección. Con `false`, "Empezar" no existe. */
	pending: boolean;
	completed: number;
	total: number;
}

/**
 * Cuántas lecciones lleva hechas el negocio.
 *
 * Lo consultan el menú lateral y la barra de abajo, que dibujan la misma entrada
 * en dos formas. La consulta es una sola —comparten clave de react-query— y lo
 * que se comparte de verdad es la definición de "pendiente", que es lo que se
 * podía desincronizar.
 *
 * Cuenta las tres lecciones y no los cinco pasos del backend: la información del
 * negocio y los horarios se cargan en el onboarding, antes de entrar al panel, y
 * sumarlos acá haría que el contador arrancara en "2 de 5" por dos pasos que el
 * usuario no recuerda haber dado.
 *
 * Es del negocio, no de la persona: un profesional no tiene nada que configurar
 * y el endpoint le responde 403, así que se pide sólo cuando corresponde.
 */
export const useSetupProgress = (enabled: boolean): SetupProgress => {
	const { data } = useGetOnboardingStatus(enabled);

	const completed = data
		? LESSONS.filter((lesson) => data.steps[lesson.id]).length
		: 0;

	return {
		pending: Boolean(data) && completed < LESSONS.length,
		completed,
		total: LESSONS.length,
	};
};
