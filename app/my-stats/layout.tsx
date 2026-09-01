'use client';

import { Sidebar } from '@/components/Sidebar';
import { useBottomNav } from '@/components/BottomNav';
import { cn } from '@/lib/utils';

interface Props {
	children: React.ReactNode;
}

/**
 * Marco de "Mis estadísticas".
 *
 * El relleno de arriba y el de abajo son excluyentes porque los dibuja lo mismo:
 * con el hamburguesa flotando arriba hay que dejarle su fila, y con la barra de
 * abajo hay que dejarle la suya. Reservar las dos sería regalar 100px de pantalla
 * en un teléfono para que no se tape nada que esté ahí.
 */
const MyStatsLayout: React.FC<Props> = ({ children }) => {
	const bottomNav = useBottomNav();

	return (
		<div className="flex min-h-screen bg-background">
			<Sidebar />
			<main
				className={cn(
					'flex-1 p-4 transition-all duration-200 md:ml-(--sidebar-width) md:p-8 md:pt-8 md:pb-8',
					bottomNav
						? 'pb-[calc(4.5rem+env(safe-area-inset-bottom))]'
						: 'pt-10',
				)}
			>
				{children}
			</main>
		</div>
	);
};

export default MyStatsLayout;
