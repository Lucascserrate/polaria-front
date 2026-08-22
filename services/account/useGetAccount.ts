import { useQuery } from '@tanstack/react-query';
import { ACCOUNT_KEY, getAccount } from './account.service';

/**
 * La cuenta del panel.
 *
 * Cachea largo a propósito: el nombre del negocio se edita desde Configuración
 * —que invalida esta clave— y el correo viene de Google, así que no hay nada que
 * revalidar al cambiar de pantalla.
 */
const useGetAccount = () => {
	return useQuery({
		queryKey: ACCOUNT_KEY,
		queryFn: getAccount,
		staleTime: 5 * 60 * 1000,
	});
};

export default useGetAccount;
