import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SETTINGS_KEY } from '@/modules/settings/utils/constants';
import { completeWhatsappEmbeddedSignup } from './settings.service';

/**
 * Completa el Embedded Signup y refresca la configuración.
 *
 * La invalidación es lo que hace visible un cambio de número: sin ella la
 * tarjeta seguiría mostrando el número anterior hasta recargar la página, que es
 * justo el momento en que el negocio necesita confirmar que quedó el nuevo.
 */
const useCompleteWhatsappSignup = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: completeWhatsappEmbeddedSignup,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
		},
	});
};

export default useCompleteWhatsappSignup;
