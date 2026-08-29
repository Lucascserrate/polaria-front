import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SETTINGS_KEY } from '@/modules/settings/utils/constants';
import { refreshWhatsappBilling } from './settings.service';

/**
 * Le avisa al backend que el negocio ya configuró la facturación en Meta.
 *
 * Existe porque eso se arregla **fuera** de Polaria, en el Billing Hub: sin este
 * botón, la pantalla seguiría diciendo "pendiente" hasta que otro envío fallara.
 * No comprueba nada —Meta no nos deja— sino que desbloquea: el veredicto real llega
 * con el próximo envío.
 */
const useRefreshWhatsappBilling = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: refreshWhatsappBilling,
		// Como en el resto de ajustes: se recarga lo que el backend tiene de verdad.
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
		},
		onError: (error) => {
			console.error('Error refreshing WhatsApp billing:', error);
		},
	});
};

export default useRefreshWhatsappBilling;
