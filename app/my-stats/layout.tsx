import AppShell from '@/components/AppShell';

interface Props {
	children: React.ReactNode;
}

/**
 * Marco de "Mis estadísticas".
 *
 * Nada propio: es el marco del panel. Lo que esta pantalla necesitaba de más —el
 * hueco de arriba o el de abajo según cómo se navegue— lo resuelve `AppShell`
 * para todas.
 */
const MyStatsLayout: React.FC<Props> = ({ children }) => (
	<AppShell className="p-4 md:p-8">{children}</AppShell>
);

export default MyStatsLayout;
