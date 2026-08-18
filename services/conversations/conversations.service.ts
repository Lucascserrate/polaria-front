import { axiosInstance } from '@/lib/axios';

/**
 * Una conversación de WhatsApp que espera atención humana.
 *
 * Polaria no responde nada en esta conversación hasta que alguien le devuelva el
 * control desde el panel.
 */
export type PendingHandoff = {
	conversationId: string;
	clientId: string;
	clientName: string | null;
	clientPhone: string | null;
	/** ISO 8601. Puede faltar en conversaciones anteriores a este registro. */
	handoffRequestedAt: string | null;
	handoffReason: string | null;
	lastMessageAt: string | null;
};

export const getHandedOffConversations = async (): Promise<PendingHandoff[]> => {
	const { data } = await axiosInstance.get<PendingHandoff[]>(
		'/conversations/handed-off',
	);
	return data;
};

/** Devuelve la conversación a Polaria. No le avisa nada al cliente. */
export const resumeConversation = async (
	conversationId: string,
): Promise<void> => {
	await axiosInstance.post(`/conversations/${conversationId}/resume`);
};
