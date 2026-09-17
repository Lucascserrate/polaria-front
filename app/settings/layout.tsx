import type { Metadata } from 'next';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = { title: 'Configuración' };

interface Props {
	children: React.ReactNode;
}

const SettingsLayout: React.FC<Props> = ({ children }) => (
	<AppShell className="p-4 md:p-8">{children}</AppShell>
);

export default SettingsLayout;
