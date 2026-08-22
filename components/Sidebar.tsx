'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	Calendar,
	Settings,
	Users,
	Scissors,
	Wallet,
	Menu,
	X,
	BookIcon,
	Rocket,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LuLogOut } from 'react-icons/lu';
import { useLogout } from '@/modules/auth/hooks/useLogout';
import { cn } from '@/lib/utils';
import { Logo } from '@/app/logo';
import { ROUTES } from '@/constants/routes';
import useGetOnboardingStatus from '@/services/onboarding/useGetOnboardingStatus';
import { SETUP_STEP_COUNT } from '@/modules/onboarding/PolariaSetupChecklist';

const navItems = [
	{ href: ROUTES.agenda, label: 'Agenda', icon: BookIcon },
	{ href: ROUTES.appointments, label: 'Citas', icon: Calendar },
	{ href: ROUTES.staff, label: 'Personal', icon: Users },
	{ href: ROUTES.services, label: 'Servicios', icon: Scissors },
	{ href: ROUTES.reports, label: 'Contabilidad', icon: Wallet },
	// { href: ROUTES.chat, label: 'Chat', icon: MessageCircle },
	{ href: ROUTES.settings, label: 'Configuración', icon: Settings },
];

export function Sidebar() {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);

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
			<Button
				variant="ghost"
				size="icon"
				className="fixed top-4 right-4 z-50 md:hidden"
				onClick={() => setIsOpen(!isOpen)}
			>
				{isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
			</Button>

			{/* Overlay for mobile */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-30 md:hidden"
					onClick={() => setIsOpen(false)}
				/>
			)}

			{/* Sidebar */}
			<aside
				className={cn(
					'fixed top-0 left-0 h-screen w-64 bg-white border-r border-neutral-200 transition-all duration-300 z-40',
					isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
				)}
			>
				<div className="flex flex-col h-full">
					{/* Header */}
					<div className="p-6 border-b border-neutral-200">
						<div className="flex items-center gap-3">
							<Logo className="" />
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex-1 p-4 space-y-1">
						{setupPending && (
							<Link
								href={ROUTES.setup}
								onClick={() => setIsOpen(false)}
								className={cn(
									'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
									pathname === ROUTES.setup
										? 'bg-neutral-100 text-neutral-900 border border-neutral-300'
										: 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50',
								)}
							>
								<Rocket className="w-4 h-4 shrink-0" />
								<span className="text-sm font-medium">Empezar</span>
								<span className="ml-auto rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold tabular-nums text-amber-700 dark:text-amber-500">
									{completedSteps} de {SETUP_STEP_COUNT}
								</span>
							</Link>
						)}

						{navItems.map((item) => {
							const Icon = item.icon;
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setIsOpen(false)}
									className={cn(
										'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
										isActive
											? 'bg-neutral-100 text-neutral-900 border border-neutral-300'
											: 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50',
									)}
								>
									<Icon className="w-4 h-4 shrink-0" />
									<span className="text-sm font-medium">{item.label}</span>
								</Link>
							);
						})}
					</nav>

					{/* Footer */}
					<div className="px-4 py-6 border-t border-neutral-200">
						<button
							className="flex items-center gap-2 cursor-pointer"
							onClick={() => mutate()}
						>
							<LuLogOut size={16} />
							<p className="text-sm font-medium">Cerrar sesión</p>
						</button>
					</div>
				</div>
			</aside>
		</>
	);
}
