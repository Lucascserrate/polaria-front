'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CircleUserRound, Ellipsis, LogOut, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import {
	adminNavItems,
	professionalNavItems,
	BOTTOM_BAR_ROUTES,
	type NavItem,
} from '@/components/nav-items';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { useSessionActor } from '@/modules/auth/hooks/useAuth';
import { useLogout } from '@/modules/auth/hooks/useLogout';
import { isAdminRole } from '@/modules/auth/session';
import {
	useSetupProgress,
	type SetupProgress,
} from '@/modules/onboarding/useSetupProgress';
import useGetAccount from '@/services/account/useGetAccount';

/**
 * Si esta sesión navega por la barra de abajo en lugar del cajón lateral.
 *
 * Pide un `actor` resuelto: mientras la sesión no llegó devuelve `false`, para que
 * la barra no aparezca abajo y se vaya un cuadro después. Aparecer y desaparecer
 * es peor que tardar.
 *
 * Lo consultan los marcos de pantalla para reservarle el alto, así que la
 * respuesta tiene que ser la misma en todos: por eso vive acá y no en cada uno.
 */
export const useBottomNav = (): boolean => {
	const { actor } = useSessionActor();
	return actor !== null;
};

/** Cuánto hay que haber bajado para que la barra se aparte. */
const HIDE_AFTER = 64;

/** Ruido de scroll que no cuenta como cambio de dirección (rebote, temblor). */
const NOISE = 4;

/**
 * Si la barra tiene que apartarse porque quien lee va bajando.
 *
 * Mira el scroll de la ventana, no el de un contenedor, y eso decide solo el
 * comportamiento en cada pantalla: donde la página scrollea, la barra se corre y
 * devuelve sus 56px mientras se lee; en la agenda y en clientes la ventana no
 * scrollea nunca —scrollea el contenido por dentro— así que se queda quieta, que
 * es donde uno la quiere fija. Una sola regla, sin excepciones escritas a mano.
 *
 * Vuelve al primer gesto hacia arriba, y arriba de todo siempre está: apartarse
 * es para no estorbar mientras se baja, no para hacerse buscar.
 */
const useHiddenByScroll = (): boolean => {
	const [hidden, setHidden] = useState(false);

	useEffect(() => {
		let last = window.scrollY;

		const onScroll = () => {
			const y = window.scrollY;

			if (y < HIDE_AFTER) setHidden(false);
			else if (y > last + NOISE) setHidden(true);
			else if (y < last - NOISE) setHidden(false);

			last = y;
		};

		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return hidden;
};

/** Tailwind necesita la clase entera escrita; la cantidad de celdas la elige. */
const COLUMNS: Record<number, string> = {
	3: 'grid-cols-3',
	4: 'grid-cols-4',
	5: 'grid-cols-5',
};

/** Una celda: ícono arriba, nombre abajo, todo el alto tocable. */
const cellClasses = (active: boolean) =>
	cn(
		'relative flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
		active ? 'text-foreground' : 'text-muted-foreground',
	);

/**
 * La navegación del panel en el teléfono.
 *
 * Los destinos de todos los días quedan a la vista y bajo el pulgar, en vez de a
 * dos toques detrás de un botón en la esquina de arriba —que además es la esquina
 * más lejos del pulgar en un teléfono grande—.
 *
 * La última celda no es un destino sino una hoja. Para el profesional, cuyos dos
 * destinos entran enteros en la barra, contiene su cuenta y se llama así. Para el
 * negocio contiene lo que no entró —el equipo, los servicios, la configuración— y
 * se llama "Más". Es la misma celda resolviendo el mismo problema: dónde va lo
 * que no se usa todos los días.
 *
 * Qué entra lo decide `BOTTOM_BAR_ROUTES`. Una pantalla nueva del menú cae en la
 * hoja sin que haya que tocar nada acá.
 */
const BottomNav: React.FC = () => {
	const pathname = usePathname();
	const hidden = useHiddenByScroll();

	const { actor } = useSessionActor();
	const isAdmin = isAdminRole(actor?.role);
	const items = isAdmin ? adminNavItems : professionalNavItems;

	const inBar = items.filter((item) => BOTTOM_BAR_ROUTES.includes(item.href));
	const rest = items.filter((item) => !BOTTOM_BAR_ROUTES.includes(item.href));

	const setup = useSetupProgress(isAdmin);

	return (
		<nav
			aria-label="Navegación"
			className={cn(
				'fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] transition-transform duration-200 motion-reduce:transition-none md:hidden',
				// Apartada sigue existiendo para el teclado: si algo de adentro toma el
				// foco, vuelve sola en vez de dejar el foco en un lugar invisible.
				hidden && 'translate-y-full focus-within:translate-y-0',
			)}
		>
			<div className={cn('grid h-14', COLUMNS[inBar.length + 1])}>
				{inBar.map((item) => {
					const active = pathname === item.href;
					const Icon = item.icon;

					return (
						<Link
							key={item.href}
							href={item.href}
							aria-current={active ? 'page' : undefined}
							className={cellClasses(active)}
						>
							<Icon className="size-5" />
							{item.short ?? item.label}
						</Link>
					);
				})}

				<MoreSheet
					items={rest}
					setup={isAdmin ? setup : null}
					pathname={pathname}
				/>
			</div>
		</nav>
	);
};

interface MoreSheetProps {
	/** Los destinos que no entraron en la barra. Vacío para un profesional. */
	items: NavItem[];
	/** El progreso de configuración, o `null` si a esta sesión no le toca. */
	setup: SetupProgress | null;
	pathname: string;
}

/**
 * Lo que no entró en la barra, en una hoja que sube desde la propia barra.
 *
 * "Empezar" va primero y separado, igual que en el menú lateral: no es una
 * sección del producto sino una tarea que se termina y desaparece. Y como ahora
 * queda dentro de la hoja, el aviso de que hay algo pendiente sube a la celda: un
 * pendiente escondido detrás de un toque es un pendiente que nadie ve.
 */
const MoreSheet: React.FC<MoreSheetProps> = ({ items, setup, pathname }) => {
	const { data } = useGetAccount();
	const { mutate: logout } = useLogout();

	const showSetup = Boolean(setup?.pending);
	const hasItems = items.length > 0;
	const active =
		items.some((item) => pathname === item.href) || pathname === ROUTES.setup;

	return (
		<Drawer>
			<DrawerTrigger className={cellClasses(active)}>
				<span className="relative flex">
					{hasItems ? (
						<Ellipsis className="size-5" />
					) : (
						<CircleUserRound className="size-5" />
					)}
					{showSetup && (
						<span className="absolute -top-0.5 -right-1 size-1.5 rounded-full bg-amber-500" />
					)}
				</span>
				{hasItems ? 'Más' : 'Cuenta'}
			</DrawerTrigger>

			<DrawerContent>
				<DrawerHeader className="text-left">
					<DrawerTitle>{hasItems ? 'Más' : 'Tu cuenta'}</DrawerTitle>
					<DrawerDescription>
						{data?.email ?? 'Sesión iniciada'}
					</DrawerDescription>
				</DrawerHeader>

				<div className="space-y-1 px-4 pb-[calc(2rem+env(safe-area-inset-bottom))]">
					{showSetup && setup && (
						<>
							<SheetLink href={ROUTES.setup} icon={Rocket} label="Empezar">
								<span className="ml-auto rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-amber-700 dark:text-amber-500">
									{setup.completed} de {setup.total}
								</span>
							</SheetLink>

							<div className="my-2 border-t border-border" aria-hidden="true" />
						</>
					)}

					{items.map((item) => (
						<SheetLink
							key={item.href}
							href={item.href}
							icon={item.icon}
							label={item.label}
						/>
					))}

					{hasItems && (
						<div className="my-2 border-t border-border" aria-hidden="true" />
					)}

					<Button
						type="button"
						variant="outline"
						size="lg"
						className="w-full"
						onClick={() => logout()}
					>
						<LogOut className="size-4" />
						Cerrar sesión
					</Button>
				</div>
			</DrawerContent>
		</Drawer>
	);
};

interface SheetLinkProps {
	href: string;
	icon: NavItem['icon'];
	label: string;
	children?: React.ReactNode;
}

/** Una fila de la hoja. Cierra al navegar: si no, queda tapando el destino. */
const SheetLink: React.FC<SheetLinkProps> = ({
	href,
	icon: Icon,
	label,
	children,
}) => (
	<DrawerClose asChild>
		<Link
			href={href}
			className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-muted"
		>
			<Icon className="size-4 shrink-0 text-muted-foreground" />
			{label}
			{children}
		</Link>
	</DrawerClose>
);

export default BottomNav;
