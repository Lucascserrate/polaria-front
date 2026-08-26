import { useQuery } from '@tanstack/react-query';
import {
	getBusinessContext,
	type BusinessContextResponse,
} from './settings.service';

/**
 * El marco del negocio, para pantallas que no administran nada.
 *
 * Existe aparte de `useGetSettings` porque ese endpoint es de administración y a un
 * profesional le responde 403. Usarlo en su agenda dejaba la pantalla sin zona
 * horaria —o sea, mostrando el día del navegador en lugar del día del local— y sin
 * el horario que sombrea lo abierto.
 */
const useGetBusinessContext = () =>
	useQuery<BusinessContextResponse>({
		queryKey: ['business-context'],
		queryFn: getBusinessContext,
	});

export default useGetBusinessContext;
