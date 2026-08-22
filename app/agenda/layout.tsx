import { Sidebar } from '@/components/Sidebar';

interface Props {
	children: React.ReactNode;
}

/**
 * Marco de la agenda.
 *
 * Sin padding y a la altura de la ventana, a diferencia del resto del panel: acá
 * el contenido es un calendario, y cada píxel que se le quite es media hora del
 * día que deja de verse. El scroll lo maneja la grilla, no esta pantalla.
 *
 * El espacio de arriba en móvil deja libre el botón del menú, que flota fijo en
 * esa esquina.
 */
const AgendaLayout: React.FC<Props> = ({ children }) => {
	return (
		<div className="flex h-screen overflow-hidden bg-background">
			<Sidebar />
			<main className="flex min-h-0 flex-1 flex-col overflow-hidden pt-14 transition-all duration-200 md:ml-(--sidebar-width) md:pt-0">
				{children}
			</main>
		</div>
	);
};

export default AgendaLayout;
