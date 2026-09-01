'use client';

import BottomNav, { useBottomNav } from '@/components/BottomNav';
import ImpersonationBanner from '@/components/ImpersonationBanner';
import { Sidebar } from '@/components/Sidebar';
import { cn } from '@/lib/utils';

interface Props {
	children: React.ReactNode;
	/**
	 * `page` scrollea la ventana: el marco crece con el contenido. Es lo que
	 * quieren casi todas las pantallas.
	 *
	 * `fixed` mide exactamente la ventana y el scroll lo maneja el contenido por
	 * dentro. Lo usan la agenda y la lista de clientes, donde lo que crece es una
	 * grilla o una tabla: si scrolleara la pantalla entera, el encabezado y el
	 * buscador se irían con ella.
	 */
	variant?: 'page' | 'fixed';
	/** Relleno y disposición propios del contenido. */
	className?: string;
	/**
	 * El botón de menú flotante en móvil. La agenda lo apaga y pone el suyo dentro
	 * de la barra del calendario, donde no le cuesta una franja de alto.
	 *
	 * Con la barra de abajo no se dibuja en ningún caso: dos formas de llegar al
	 * mismo menú es una de más.
	 */
	floatingTrigger?: boolean;
}

/**
 * El marco de todas las pantallas del panel: menú al costado y contenido al lado.
 *
 * Existe por una razón concreta y no por prolijidad. Los nueve marcos eran nueve
 * copias de dos formas, y en móvil hay dos huecos que hay que reservar —el del
 * botón flotante arriba, el de la barra de navegación abajo— que dependen de
 * quién entró. Repartida en nueve archivos, esa cuenta se desincroniza el día que
 * alguien agrega una pantalla y copia el marco de al lado.
 *
 * Los dos huecos son excluyentes porque los dibuja lo mismo: o hay botón
 * flotante arriba, o hay barra abajo. Reservar los dos sería regalar 100px de un
 * teléfono para que no se tape nada que esté ahí.
 *
 * Los rellenos van con `max-md:` a propósito: así no compiten con el `md:p-8` que
 * cada pantalla trae en su `className`. Sin eso habría que anular a mano el
 * relleno de escritorio en cada una.
 */
const AppShell: React.FC<Props> = ({
	children,
	variant = 'page',
	className,
	floatingTrigger = true,
}) => {
	const bottomNav = useBottomNav();
	const showsFloatingTrigger = floatingTrigger && !bottomNav;

	return (
		<div
			className={cn(
				'flex flex-col bg-background',
				variant === 'fixed' ? 'h-screen overflow-hidden' : 'min-h-screen',
			)}
		>
			{/*
			 * Fuera del marco y arriba de todo: una sesión de soporte no es un dato de
			 * una pantalla, es de quién son todas. En `fixed` el alto que ocupa se lo
			 * saca a la grilla, que es correcto —la agenda tiene que entrar en lo que
			 * queda— y por eso el contenedor pasa a ser una columna.
			 */}
			<ImpersonationBanner />

			<div
				className={cn(
					'flex min-h-0 flex-1',
					variant === 'fixed' && 'overflow-hidden',
				)}
			>
				<Sidebar floatingTrigger={floatingTrigger} />

				<main
					className={cn(
						'flex-1 transition-all duration-200 md:ml-(--sidebar-width)',
						variant === 'fixed' && 'flex min-h-0 flex-col overflow-hidden',
						className,
						// El hueco del botón flotante, solo mientras el botón exista.
						showsFloatingTrigger && 'max-md:pt-14',
						/*
						 * El hueco de la barra. En `fixed` es su alto exacto, porque ahí el
						 * relleno le saca alto a una grilla que se mide en horas; en `page`
						 * lleva un respiro más, para que la última línea no quede pegada.
						 */
						bottomNav &&
							(variant === 'fixed'
								? 'max-md:pb-[calc(3.5rem+env(safe-area-inset-bottom))]'
								: 'max-md:pb-[calc(4.5rem+env(safe-area-inset-bottom))]'),
					)}
				>
					{children}
				</main>

				{bottomNav && <BottomNav />}
			</div>
		</div>
	);
};

export default AppShell;
