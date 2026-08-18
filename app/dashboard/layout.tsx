import { Sidebar } from '@/components/Sidebar';

interface Props {
	children: React.ReactNode;
}

const DashboardLayout: React.FC<Props> = ({ children }) => {
	return (
		<div className="flex min-h-screen md:h-screen md:overflow-hidden bg-background">
			<Sidebar />
			<main className="flex-1 pt-10 md:ml-60 p-4 md:p-8 transition-all duration-200 md:flex md:flex-col md:min-h-0 md:overflow-hidden">
				{children}
			</main>
		</div>
	);
};
export default DashboardLayout;
