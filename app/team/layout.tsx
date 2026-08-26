import { Sidebar } from '@/components/Sidebar';

interface Props {
	children: React.ReactNode;
}

const TeamLayout: React.FC<Props> = ({ children }) => {
	return (
		<div className="flex min-h-screen bg-background">
			<Sidebar />
			<main className="flex-1 p-4 pt-14 transition-all duration-200 md:ml-(--sidebar-width) md:p-8 md:pt-8">
				{children}
			</main>
		</div>
	);
};

export default TeamLayout;
