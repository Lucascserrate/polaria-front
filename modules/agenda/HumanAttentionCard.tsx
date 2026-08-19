'use client';

import { Bot, MessageCircle, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatTimeAgo } from '@/lib/date';
import useGetHandedOffConversations from '@/services/conversations/useGetHandedOffConversations';
import useResumeConversation from '@/services/conversations/useResumeConversation';

/** `wa.me` no acepta el `+` ni separadores. */
const toWhatsAppLink = (phone: string) =>
	`https://wa.me/${phone.replace(/\D/g, '')}`;

/**
 * Conversaciones en las que Polaria dejó de responder porque el cliente pidió
 * hablar con una persona.
 *
 * No se muestra cuando no hay ninguna: es un aviso, y un recuadro permanente que
 * casi siempre dice "no hay nada" deja de leerse justo cuando importa.
 */
const HumanAttentionCard: React.FC = () => {
	const { data: pending } = useGetHandedOffConversations();
	const { mutate: resume, isPending, variables } = useResumeConversation();

	if (!pending?.length) return null;

	return (
		<div className="bg-card border border-amber-500/50 rounded-lg shrink-0 overflow-hidden">
			<div className="flex items-center gap-2 px-4 py-3 bg-amber-500/10">
				<UserRound className="w-4 h-4 text-amber-600 dark:text-amber-500 shrink-0" />
				<span className="text-sm font-medium">Atención humana</span>
				<span className="ml-auto text-sm font-semibold text-amber-600 dark:text-amber-500">
					{pending.length}
				</span>
			</div>

			<ul className="divide-y divide-border">
				{pending.map((conversation) => {
					const name =
						conversation.clientName?.trim() ||
						conversation.clientPhone ||
						'Cliente sin nombre';
					// La fila que se está devolviendo sale de la mutación, así que no hace
					// falta un estado aparte.
					const isResuming =
						isPending && variables === conversation.conversationId;

					return (
						<li key={conversation.conversationId} className="px-4 py-3">
							<p className="text-sm font-medium truncate">{name}</p>
							<p className="text-xs text-muted-foreground mt-0.5">
								{conversation.handoffRequestedAt
									? `Espera ${formatTimeAgo(conversation.handoffRequestedAt)}`
									: 'Esperando respuesta'}
							</p>

							<div className="flex items-center gap-1 mt-2">
								{conversation.clientPhone && (
									<Button
										asChild
										variant="ghost"
										size="sm"
										className="h-7 px-2 text-xs"
									>
										<a
											href={toWhatsAppLink(conversation.clientPhone)}
											target="_blank"
											rel="noopener noreferrer"
										>
											<MessageCircle className="w-3 h-3 mr-1" />
											Responder
										</a>
									</Button>
								)}

								<Button
									variant="ghost"
									size="sm"
									className="h-7 px-2 text-xs ml-auto"
									disabled={isResuming}
									onClick={() => resume(conversation.conversationId)}
								>
									<Bot className="w-3 h-3 mr-1" />
									{isResuming ? 'Devolviendo...' : 'Devolver a Polaria'}
								</Button>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default HumanAttentionCard;
