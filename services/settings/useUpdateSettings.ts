import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SETTINGS_KEY } from '@/modules/settings/utils/constants';
import { updateSettings } from './settings.service';

const useUpdateSettings = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateSettings,
		/**
		 * Se invalida en lugar de escribir la respuesta en la caché: así el
		 * formulario vuelve a mostrar lo que el backend tiene de verdad, y no lo que
		 * creemos que guardó.
		 */
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
		},
		onError: (error) => {
			console.error('Error updating settings:', error);
		},
	});
};

export default useUpdateSettings;
