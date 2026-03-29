'use client';

import { useState } from 'react';
import ChatInput from '@/modules/chat/ChatInput';
import ChatWindow from '@/modules/chat/ChatWindow';
import { getRandomAIResponse } from '@/lib/mocks';

interface Message {
	id: string;
	content: string;
	sender: 'user' | 'assistant';
	timestamp: Date;
}

export default function ChatPage() {
	const [messages, setMessages] = useState<Message[]>([
		{
			id: '0',
			content:
				'¡Hola! Soy tu asistente de IA para la barbería. ¿En qué puedo ayudarte hoy?',
			sender: 'assistant',
			timestamp: new Date(),
		},
	]);
	const [isLoading, setIsLoading] = useState(false);

	const handleSendMessage = async (userMessage: string) => {
		// Agregar mensaje del usuario
		const newUserMessage: Message = {
			id: Date.now().toString(),
			content: userMessage,
			sender: 'user',
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, newUserMessage]);
		setIsLoading(true);

		// Simular delay de IA respondiendo
		setTimeout(() => {
			const assistantResponse: Message = {
				id: (Date.now() + 1).toString(),
				content: getRandomAIResponse(),
				sender: 'assistant',
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, assistantResponse]);
			setIsLoading(false);
		}, 800);
	};

	return (
		<div className="flex flex-col flex-1 min-h-0 gap-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Asistente IA</h1>
				<p className="text-muted-foreground mt-1">
					Conversa con nuestro asistente inteligente para obtener ayuda sobre
					citas y servicios
				</p>
			</div>

			{/* Chat Container */}
			<div className="bg-card border border-border rounded-lg flex flex-col flex-1 min-h-0">
				{/* Header indicador de IA */}
				<div className="border-b border-border px-6 py-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-t-lg">
					<div className="flex items-center gap-2">
						<div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
						<p className="text-sm font-medium">Asistente IA en línea</p>
					</div>
				</div>

				{/* Chat Messages */}
				<ChatWindow messages={messages} isLoading={isLoading} />

				{/* Chat Input */}
				<div className="border-t border-border px-6 py-4">
					<ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
				</div>
			</div>
		</div>
	);
}
