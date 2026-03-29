'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface Props {
	onSendMessage: (message: string) => void;
	isLoading: boolean;
}

const ChatInput: React.FC<Props> = ({ onSendMessage, isLoading }) => {
	const [input, setInput] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (input.trim()) {
			onSendMessage(input);
			setInput('');
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-2 items-center">
			<Input
				type="text"
				placeholder="Escribe tu mensaje..."
				value={input}
				onChange={(e) => setInput(e.target.value)}
				disabled={isLoading}
				className="flex-1"
			/>
			<Button
				type="submit"
				size="icon"
				disabled={isLoading || !input.trim()}
				className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-200"
			>
				<Send className="w-4 h-4" />
			</Button>
		</form>
	);
};

export default ChatInput;
