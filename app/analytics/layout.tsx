import AppShell from '@/components/AppShell';

interface Props {
	children: React.ReactNode;
}

const AnalyticsLayout: React.FC<Props> = ({ children }) => (
	<AppShell className="p-4 md:p-8">{children}</AppShell>
);

export default AnalyticsLayout;
