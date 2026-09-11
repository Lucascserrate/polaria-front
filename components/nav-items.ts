import {
	BookIcon,
	BookOpen,
	ChartLine,
	Contact,
	Globe,
	Settings,
	Users,
	type LucideIcon,
} from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export interface NavItem {
	href: string;
	label: string;
	icon: LucideIcon;
	/** Cómo se llama cuando comparte fila con otras tres en un teléfono. */
	short?: string;
}

/** El panel del negocio: lo que ve quien administra. */
export const adminNavItems: NavItem[] = [
	{ href: ROUTES.agenda, label: 'Agenda', icon: BookIcon },
	{ href: ROUTES.team, label: 'Equipo', icon: Users },
	{ href: ROUTES.clients, label: 'Clientes', icon: Contact },
	{ href: ROUTES.services, label: 'Servicios', icon: BookOpen },
	{ href: ROUTES.myPage, label: 'Mi página', icon: Globe },
	{ href: ROUTES.analytics, label: 'Analíticas', icon: ChartLine },
	{ href: ROUTES.settings, label: 'Configuración', icon: Settings },
];

export const professionalNavItems: NavItem[] = [
	{
		href: ROUTES.myAgenda,
		label: 'Mi agenda',
		icon: BookIcon,
		short: 'Agenda',
	},
	{
		href: ROUTES.myStats,
		label: 'Mis estadísticas',
		icon: ChartLine,
		short: 'Estadísticas',
	},
];

export const BOTTOM_BAR_ROUTES: readonly string[] = [
	ROUTES.agenda,
	ROUTES.clients,
	ROUTES.analytics,
	ROUTES.myAgenda,
	ROUTES.myStats,
];
