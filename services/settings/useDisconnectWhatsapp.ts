import { useMutation, useQueryClient } from '@tanstack/react-query';
import { SETTINGS_KEY } from '@/modules/settings/utils/constants';
import { disconnectWhatsapp } from './settings.service';

const useDisconnectWhatsapp = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: disconnectWhatsapp,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: SETTINGS_KEY });
		},
		onError: (error) => {
			console.error('Error disconnecting WhatsApp:', error);
		},
	});
};

export default useDisconnectWhatsapp;
