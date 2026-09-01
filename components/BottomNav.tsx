'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	BookIcon,
	ChartLine,
	CircleUserRound,
	LogOut,
	type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Drawer,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	DrawerTrigger,
} from '@/components/ui/drawer';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { useSessionActor } from '@/modules/auth/hooks/useAuth';
import { useLogout } from '@/modules/auth/hooks/useLogout';
import { isAdminRole } from '@/modules/auth/session';
import useGetAccount from '@/services/account/useGetAccount';

/**
 * Si esta sesión navega por la barra de abajo en lugar del cajón lateral.
 *
 * Solo el profesional, y no por jerarquía sino por aritmética: su menú tiene dos
 * destinos, y dos destinos detrás de un botón que abre un panel con velo es mucha
 * maquinaria para nada. El del negocio tiene seis más "Empezar", que no entran en
 * una barra, así que ahí el cajón sigue siendo la forma correcta.
 *
 * Pide un `actor` resuelto: mientras la sesión no llegó devuelve `false`, para que
 * la barra no aparezca abajo y se vaya un cuadro después si resulta ser el dueño.
 * Aparecer y desaparecer es peor que tardar.
 */
export const useBottomNav = (): boolean => {
	const { actor } = useSessionActor();
	return actor !== null && !isAdminRole(actor.role);
};

interface Tab {
	href: string;
	label: string;
	icon: LucideIcon;
}

const TABS: Tab[] = [
	{ href: ROUTES.myAgenda, label: 'Agenda', icon: BookIcon },
	{ href: ROUTES.myStats, label: 'Estadísticas', icon: ChartLine },
];

/** Una celda de la barra: ícono arriba, nombre abajo, todo tocable. */
const tabClasses = (active: boolean) =>
	cn(
		'flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors',
		active ? 'text-foreground' : 'text-muted-foreground',
	);

/**
 * La navegación del profesional en el teléfono.
 *
 * Los dos destinos quedan a la vista y bajo el pulgar, en vez de a dos toques
 * detrás de un botón en la esquina de arriba —que además es la esquina más lejos
 * del pulgar en un teléfono grande—. De paso libera el borde superior, que estaba
 * ocupado por el botón flotante del menú.
 *
 * La tercera celda no es un destino sino una hoja: el correo y cerrar sesión
 * vivían en el pie del cajón lateral, y sin cajón necesitaban casa. No es una
 * pantalla porque hoy son dos líneas, y una pantalla de dos líneas se siente como
 * un lugar al que uno llegó por error.
 */
const BottomNav: React.FC = () => {
	const pathname = usePathname();

	return (
		<nav
			aria-label="Navegación"
			className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
		>
			<div className="grid h-14 grid-cols-3">
				{TABS.map((tab) => {
					const active = pathname === tab.href;
					const Icon = tab.icon;

					return (
						<Link
							key={tab.href}
							href={tab.href}
							aria-current={active ? 'page' : undefined}
							className={tabClasses(active)}
						>
							<Icon className="size-5" />
							{tab.label}
						</Link>
					);
				})}

				<AccountTab />
			</div>
		</nav>
	);
};

/** El correo y cerrar sesión, en una hoja que sube desde la propia barra. */
const AccountTab: React.FC = () => {
	const { data } = useGetAccount();
	const { mutate: logout } = useLogout();

	return (
		<Drawer>
			<DrawerTrigger className={tabClasses(false)}>
				<CircleUserRound className="size-5" />
				Cuenta
			</DrawerTrigger>

			<DrawerContent>
				<DrawerHeader>
					<DrawerTitle>Tu cuenta</DrawerTitle>
					<DrawerDescription>
						{data?.email ?? 'Sesión iniciada'}
					</DrawerDescription>
				</DrawerHeader>

				<div className="px-4 pb-8">
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

export default BottomNav;
