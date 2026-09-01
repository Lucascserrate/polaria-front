import {
	BookIcon,
	BookOpen,
	ChartLine,
	Contact,
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
	{ href: ROUTES.analytics, label: 'Analíticas', icon: ChartLine },
	{ href: ROUTES.settings, label: 'Configuración', icon: Settings },
];

/**
 * Lo que ve un profesional: su trabajo, y nada del negocio.
 *
 * No es el menú de administración con ítems escondidos. Es otro menú, y la
 * diferencia importa: los ítems que faltan no son permisos que le falten, son
 * secciones que no tienen que ver con lo que esa persona vino a hacer.
 *
 * Esconder no protege nada —eso lo hace el backend, que responde 403— así que
 * mostrar el menú correcto es una decisión de producto y no de seguridad.
 */
export const professionalNavItems: NavItem[] = [
	{ href: ROUTES.myAgenda, label: 'Mi agenda', icon: BookIcon, short: 'Agenda' },
	{
		href: ROUTES.myStats,
		label: 'Mis estadísticas',
		icon: ChartLine,
		short: 'Estadísticas',
	},
];

/**
 * Los destinos que se ganan una celda en la barra de abajo, en móvil.
 *
 * Es una lista de rutas y no un recorte de las de arriba porque la pregunta es
 * otra: el menú lateral ordena **todo lo que existe**, y esto elige lo que se
 * visita a diario. Equipo, Servicios y Configuración son pantallas de configurar
 * —se abren al arrancar y casi no se vuelve—, así que caen en la hoja.
 *
 * Lo que no está acá no se pierde: cae en "Más" por descarte. Una pantalla nueva
 * aparece sola ahí sin que haya que acordarse de agregarla en dos lugares.
 */
export const BOTTOM_BAR_ROUTES: readonly string[] = [
	ROUTES.agenda,
	ROUTES.clients,
	ROUTES.analytics,
	ROUTES.myAgenda,
	ROUTES.myStats,
];
