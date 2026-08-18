import { useMutation, useQueryClient } from '@tanstack/react-query';
import { HANDOFF_KEY } from '@/modules/conversations/constants';
import { resumeConversation } from './conversations.service';

const useResumeConversation = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: resumeConversation,
		/**
		 * Se invalida en lugar de sacar la fila de la caché a mano: la lista la
		 * decide el backend, y si el traspaso siguiera activo por algo que acá no
		 * sabemos, la conversación tiene que volver a aparecer.
		 */
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: HANDOFF_KEY });
		},
		onError: (error) => {
			console.error('Error resuming conversation:', error);
		},
	});
};

export default useResumeConversation;
