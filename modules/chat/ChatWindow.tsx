'use client';

import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import { Spinner } from '@/components/ui/spinner';

interface Message {
	id: string;
	content: string;
	sender: 'user' | 'assistant';
	timestamp: Date;
}

interface Props {
	messages: Message[];
	isLoading: boolean;
}

const ChatWindow: React.FC<Props> = ({ messages, isLoading }) => {
	const messagesEndRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages, isLoading]);

	return (
		<div className="flex-1 overflow-y-auto p-4 space-y-4">
			{messages.length === 0 && !isLoading && (
				<div className="flex items-center justify-center h-full">
					<div className="text-center space-y-2">
						<p className="text-muted-foreground">No hay mensajes aún</p>
						<p className="text-sm text-muted-foreground">
							¡Comienza a conversar con el asistente IA!
						</p>
					</div>
				</div>
			)}

			{messages.map((message) => (
				<MessageBubble
					key={message.id}
					content={message.content}
					sender={message.sender}
					timestamp={message.timestamp}
				/>
			))}

			{isLoading && (
				<div className="flex justify-start mb-4">
					<div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg px-4 py-2">
						<Spinner className="h-4 w-4" />
					</div>
				</div>
			)}

			<div ref={messagesEndRef} />
		</div>
	);
};

export default ChatWindow;
