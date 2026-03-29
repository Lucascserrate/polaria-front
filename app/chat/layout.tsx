import { Sidebar } from '@/components/Sidebar';

interface Props {
	children: React.ReactNode;
}

const ChatLayout: React.FC<Props> = ({ children }) => {
	return (
		<div className="flex flex-1 min-h-0 bg-background">
			<Sidebar />
			<main className="flex flex-col flex-1 min-h-0 pt-10 md:ml-60 p-4 md:p-8 transition-all duration-200">
				{children}
			</main>
		</div>
	);
};

export default ChatLayout;
