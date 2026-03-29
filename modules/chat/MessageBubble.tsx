interface Props {
	content: string;
	sender: 'user' | 'assistant';
	timestamp: Date;
}

const MessageBubble: React.FC<Props> = ({ content, sender, timestamp }) => {
	const isUser = sender === 'user';

	return (
		<div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
			<div
				className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
					isUser
						? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
						: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white'
				}`}
			>
				<p className="text-sm">{content}</p>
				<p
					className={`text-xs mt-1 ${isUser ? 'text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'}`}
				>
					{timestamp.toLocaleTimeString('es-ES', {
						hour: '2-digit',
						minute: '2-digit',
					})}
				</p>
			</div>
		</div>
	);
};

export default MessageBubble;
