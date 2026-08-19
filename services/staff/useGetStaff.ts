import { useQuery } from '@tanstack/react-query';
import { getStaff } from './staff.service';

/**
 * El equipo completo, con sus servicios.
 *
 * Reemplaza al `getStaff()` suelto que el formulario de citas hacía dentro de un
 * `useEffect` con sus propios estados de carga y error: la caché compartida
 * evita volver a pedir la lista cada vez que se abre el diálogo.
 */
const useGetStaff = () => {
	return useQuery({
		queryKey: ['staff', 'all'],
		queryFn: getStaff,
	});
};

export default useGetStaff;
