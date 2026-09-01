import AppShell from '@/components/AppShell';

interface Props {
	children: React.ReactNode;
}

/**
 * Marco de "Mi agenda".
 *
 * Igual que el de la Agenda del negocio y por el mismo motivo: el contenido es un
 * calendario, y cada píxel que se le quite es media hora del día que deja de
 * verse. El botón del menú tampoco flota acá, vive en la barra.
 */
const MyAgendaLayout: React.FC<Props> = ({ children }) => (
	<AppShell variant="fixed" floatingTrigger={false}>
		{children}
	</AppShell>
);

export default MyAgendaLayout;
