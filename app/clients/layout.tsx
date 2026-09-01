import { Sidebar } from '@/components/Sidebar';

interface Props {
	children: React.ReactNode;
}

/**
 * Marco de la lista de clientes.
 *
 * A la altura de la ventana y sin scroll propio, como la agenda: acá lo que
 * crece es la tabla, y si la pantalla entera scrollea el buscador y el
 * encabezado se van con ella. El scroll lo maneja la lista, no esta pantalla.
 */
const ClientsLayout: React.FC<Props> = ({ children }) => {
	return (
		<div className="flex h-screen overflow-hidden bg-background">
			<Sidebar />
			<main className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 pt-14 transition-all duration-200 md:ml-(--sidebar-width) md:p-8 md:pt-8">
				{children}
			</main>
		</div>
	);
};

export default ClientsLayout;
