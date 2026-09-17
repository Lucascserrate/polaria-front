import type { Metadata } from 'next';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = { title: 'Empezar' };

interface Props {
	children: React.ReactNode;
}

/** Mismo marco que el resto del panel: desde acá se sale a cada pantalla. */
const SetupLayout: React.FC<Props> = ({ children }) => (
	<AppShell className="p-4 md:p-8">{children}</AppShell>
);

export default SetupLayout;
