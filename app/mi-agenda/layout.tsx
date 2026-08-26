import { Sidebar } from '@/components/Sidebar';

interface Props {
	children: React.ReactNode;
}

/**
 * Marco de "Mi agenda".
 *
 * Igual que el de la Agenda del negocio y por el mismo motivo: el contenido es un
 * calendario, y cada píxel que se le quite es media hora del día que deja de verse.
 * El botón del menú tampoco flota acá, vive en la barra.
 */
const MyAgendaLayout: React.FC<Props> = ({ children }) => {
	return (
		<div className="flex h-screen overflow-hidden bg-background">
			<Sidebar floatingTrigger={false} />
			<main className="flex min-h-0 flex-1 flex-col overflow-hidden transition-all duration-200 md:ml-(--sidebar-width)">
				{children}
			</main>
		</div>
	);
};

export default MyAgendaLayout;
