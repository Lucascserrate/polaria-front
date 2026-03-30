'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
	Calendar,
	Home,
	Settings,
	Users,
	Scissors,
	Menu,
	X,
	MessageCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LuLogOut } from 'react-icons/lu';
import { useLogout } from '@/modules/auth/hooks/useLogout';
import { cn } from '@/lib/utils';

const navItems = [
	{ href: '/dashboard', label: 'Panel', icon: Home },
	{ href: '/appointments', label: 'Citas', icon: Calendar },
	{ href: '/staff', label: 'Staff', icon: Users },
	{ href: '/services', label: 'Servicios', icon: Scissors },
	{ href: '/chat', label: 'Chat', icon: MessageCircle },
	{ href: '/settings', label: 'Configuración', icon: Settings },
];

export function Sidebar() {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);

	const { mutate } = useLogout();

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
							<div className="font-semibold text-neutral-900">Polaria</div>
						</div>
					</div>

					{/* Navigation */}
					<nav className="flex-1 p-4 space-y-1">
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
