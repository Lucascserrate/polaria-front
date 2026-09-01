'use client';

import { Sidebar } from '@/components/Sidebar';
import { useBottomNav } from '@/components/BottomNav';
import { cn } from '@/lib/utils';

interface Props {
	children: React.ReactNode;
}

/**
 * Marco de "Mi agenda".
 *
 * Igual que el de la Agenda del negocio y por el mismo motivo: el contenido es un
 * calendario, y cada píxel que se le quite es media hora del día que deja de verse.
 * El botón del menú tampoco flota acá, vive en la barra.
 *
 * Lo único que sí le quita alto es la barra de navegación de abajo, y no puede no
 * hacerlo: la grilla scrollea, así que sin ese relleno la última hora del día
 * queda para siempre debajo de la barra.
 */
const MyAgendaLayout: React.FC<Props> = ({ children }) => {
	const bottomNav = useBottomNav();

	return (
		<div className="flex h-screen overflow-hidden bg-background">
			<Sidebar floatingTrigger={false} />
			<main
				className={cn(
					'flex min-h-0 flex-1 flex-col overflow-hidden transition-all duration-200 md:ml-(--sidebar-width) md:pb-0',
					bottomNav && 'pb-[calc(3.5rem+env(safe-area-inset-bottom))]',
				)}
			>
				{children}
			</main>
		</div>
	);
};

export default MyAgendaLayout;
