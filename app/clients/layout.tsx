import AppShell from '@/components/AppShell';

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
const ClientsLayout: React.FC<Props> = ({ children }) => (
	<AppShell variant="fixed" className="p-4 md:p-8">
		{children}
	</AppShell>
);

export default ClientsLayout;
