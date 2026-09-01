import AppShell from '@/components/AppShell';

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
 * En móvil el botón del menú no flota: vive dentro de la barra del calendario,
 * al lado del selector de vista. Flotando obligaba a reservarle una franja
 * entera de alto —una fila para él solo— y acá el alto es el día.
 */
const AgendaLayout: React.FC<Props> = ({ children }) => (
	<AppShell variant="fixed" floatingTrigger={false}>
		{children}
	</AppShell>
);

export default AgendaLayout;
