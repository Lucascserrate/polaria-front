'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	Settings,
	Users,
	Scissors,
	ChartLine,
	Menu,
	X,
	BookIcon,
	Rocket,
	PanelLeftClose,
	PanelLeftOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LuLogOut } from 'react-icons/lu';
import { useLogout } from '@/modules/auth/hooks/useLogout';
import { cn } from '@/lib/utils';
import { Logo } from '@/app/logo';
import { ROUTES } from '@/constants/routes';
import { toggleSidebarPreference } from '@/components/sidebar-preference';
import {
	setMobileSidebar,
	toggleMobileSidebar,
	useMobileSidebar,
} from '@/components/sidebar-mobile';
import useGetOnboardingStatus from '@/services/onboarding/useGetOnboardingStatus';
import { SETUP_STEP_COUNT } from '@/modules/onboarding/PolariaSetupChecklist';
import TrialStatus from '@/modules/onboarding/TrialStatus';
import AccountBadge from '@/modules/account/AccountBadge';

const navItems = [
	{ href: ROUTES.agenda, label: 'Agenda', icon: BookIcon },
	{ href: ROUTES.team, label: 'Personal', icon: Users },
	{ href: ROUTES.services, label: 'Servicios', icon: Scissors },
	{ href: ROUTES.analytics, label: 'Analíticas', icon: ChartLine },
	// { href: ROUTES.chat, label: 'Chat', icon: MessageCircle },
	{ href: ROUTES.settings, label: 'Configuración', icon: Settings },
];

/** Una fila del menú, colapsada o no. El `title` es el nombre cuando no se ve. */
const itemClasses = (isActive: boolean) =>
	cn(
		'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
		'collapsed:justify-center collapsed:px-0',
		isActive
			? 'bg-neutral-100 text-neutral-900 border border-neutral-300'
			: 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50',
	);

interface Props {
	/**
	 * El botón de hamburguesa fijo arriba a la derecha, solo en móvil.
	 *
	 * La Agenda lo apaga y pone el suyo dentro de la barra del calendario: acá
	 * cada fila que se reserve para el botón es media hora del día que deja de
	 * verse.
	 */
	floatingTrigger?: boolean;
}

export function Sidebar({ floatingTrigger = true }: Props) {
	const pathname = usePathname();
	const isOpen = useMobileSidebar();

	const { mutate } = useLogout();

	/*
	 * "Empezar" solo existe mientras falte configurar algo.
	 *
	 * Es una entrada temporal, no una sección del producto: cuando el negocio
	 * termina, desaparece del menú en lugar de quedar como un ítem que siempre
	 * dice lo mismo. El estado lo decide el backend, así que se va sola.
	 */
	const { data: onboarding } = useGetOnboardingStatus();
	const setupPending = Boolean(onboarding && onboarding.nextStep !== null);
	const completedSteps = onboarding
		? Object.values(onboarding.steps).filter(Boolean).length
		: 0;

	return (
		<>
			{/* Mobile menu button */}
			{floatingTrigger && (
				<Button
					variant="ghost"
					size="icon"
					aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
					className="fixed top-4 right-4 z-50 md:hidden"
					onClick={() => toggleMobileSidebar()}
				>
					{isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
				</Button>
			)}

			{/* Overlay for mobile */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-30 md:hidden"
					onClick={() => setMobileSidebar(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					'fixed top-0 left-0 h-screen w-(--sidebar-width) bg-white border-r border-neutral-200 transition-all duration-200 z-40',
					isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
				)}
			>
				<div className="flex flex-col h-full">
					{/* Header */}
					<div className="p-6 border-b border-neutral-200 collapsed:px-2 collapsed:py-4">
						<div className="flex items-center justify-between gap-3 collapsed:flex-col collapsed:gap-3">
							{/*
							 * Dos versiones en lugar de una con el texto oculto: así el
							 * glifo queda centrado en la columna angosta sin depender de
							 * cómo esté armado el logo por dentro.
							 */}
							<Logo className="collapsed:hidden" />
							<Logo
								showWordmark={false}
								className="hidden collapsed:inline-flex"
							/>

							{/*
							 * Colapsar es solo de escritorio: en móvil el menú ya se cierra
							 * entero con el botón de arriba.
							 */}
							<button
								type="button"
								onClick={() => toggleSidebarPreference()}
								className="hidden size-8 shrink-0 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-50 hover:text-neutral-900 md:inline-flex"
							>
								<PanelLeftClose className="w-4 h-4 collapsed:hidden" />
								<PanelLeftOpen className="hidden w-4 h-4 collapsed:block" />
								<span className="sr-only collapsed:hidden">Colapsar menú</span>
								<span className="sr-only hidden collapsed:inline">
									Expandir menú
								</span>
							</button>
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex-1 p-4 space-y-1 collapsed:px-2">
						{setupPending && (
							<Link
								href={ROUTES.setup}
								onClick={() => setMobileSidebar(false)}
								className={itemClasses(pathname === ROUTES.setup)}
							>
								<span className="relative flex shrink-0">
									<Rocket className="w-4 h-4" />
									{/*
									 * Colapsado no cabe el contador, pero sí el aviso de que
									 * queda algo pendiente: sin esto, el paso se esconde.
									 */}
									<span className="absolute -top-1 -right-1 hidden size-1.5 rounded-full bg-amber-500 collapsed:block" />
								</span>
								<span className="text-sm font-medium collapsed:hidden">
									Empezar
								</span>
								<span className="ml-auto rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-amber-700 collapsed:hidden dark:text-amber-500">
									{completedSteps} de {SETUP_STEP_COUNT}
								</span>
							</Link>
						)}

						{/* "Empezar" no es una sección del producto: el separador lo dice. */}
						{setupPending && (
							<div
								className="my-2 border-t border-neutral-200"
								aria-hidden="true"
							/>
						)}

						{navItems.map((item) => {
							const Icon = item.icon;
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setMobileSidebar(false)}
									className={itemClasses(isActive)}
								>
									<Icon className="w-4 h-4 shrink-0" />
									<span className="text-sm font-medium collapsed:hidden">
										{item.label}
									</span>
								</Link>
							);
						})}
					</nav>

					{/* Footer */}
					<div className="space-y-3 px-4 py-6 border-t border-neutral-200 collapsed:px-2">
						<AccountBadge />

						{/* Solo dice algo durante la prueba y cuando venció. */}
						{/*
						 * `contents` para no dejar un hueco cuando no hay prueba de la que
						 * hablar: el envoltorio existe solo para poder esconderlo colapsado.
						 */}
						<div className="contents collapsed:hidden">
							<TrialStatus />
						</div>

						<button
							className="flex w-full items-center gap-2 cursor-pointer collapsed:justify-center"
							onClick={() => mutate()}
						>
							<LuLogOut size={16} className="shrink-0" />
							<p className="text-sm font-medium collapsed:hidden">
								Cerrar sesión
							</p>
						</button>
					</div>
				</div>
			</aside>
		</>
	);
}
