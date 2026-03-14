import { Sidebar } from '@/components/Sidebar';

export default function StaffLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex min-h-screen bg-background">
			<Sidebar />
			<main className="flex-1 pt-10 md:ml-60 p-4 md:p-8 transition-all duration-200">
				{children}
			</main>
		</div>
	);
}
