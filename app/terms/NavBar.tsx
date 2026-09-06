'use client';

import Link from 'next/link';
import { ArrowRight, Menu } from 'lucide-react';
import { useState } from 'react';

import { Logo } from '@/app/logo';
import { Button } from '@/components/ui/button';

export function NavBar() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<header className="sticky top-0 z-40 border-b border-neutral-200/70 bg-white/85 backdrop-blur-xl">
			<div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
				<Link href="/" className="flex items-center gap-2.5">
					<Logo tone="dark" className="text-[15px]" />
				</Link>
				<nav className="hidden items-center gap-8 text-sm text-neutral-600 md:flex">
					<a
						href="#reservas"
						className="transition-colors hover:text-neutral-950"
					>
						Reservas
					</a>
					<a
						href="#automatizaciones"
						className="transition-colors hover:text-neutral-950"
					>
						Automatizaciones
					</a>
					<a
						href="#integraciones"
						className="transition-colors hover:text-neutral-950"
					>
						Integraciones
					</a>
					<a
						href="#precios"
						className="transition-colors hover:text-neutral-950"
					>
						Precios
					</a>
				</nav>
				<div className="hidden items-center gap-2 md:flex">
					<Button variant="ghost" size="sm" className="rounded-full px-4">
						Acceder
					</Button>
					<Button
						size="sm"
						className="rounded-full bg-neutral-950 px-4 text-white hover:bg-neutral-800"
					>
						Empezá Gratis
					</Button>
				</div>
				<div className="relative md:hidden">
					<button
						type="button"
						aria-expanded={isMenuOpen}
						aria-controls="mobile-navigation"
						onClick={() => setIsMenuOpen((open) => !open)}
						className="flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
					>
						<Menu className="size-4" />
						<span className="sr-only">{isMenuOpen ? 'Cerrar menu' : 'Abrir menu'}</span>
					</button>
					<div
						id="mobile-navigation"
						aria-hidden={!isMenuOpen}
						className={`absolute right-0 top-12 z-50 w-64 origin-top-right rounded-2xl border border-neutral-200 bg-white p-2 shadow-[0_18px_50px_rgba(0,0,0,0.12)] transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none ${isMenuOpen ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none -translate-y-1 scale-[0.98] opacity-0'}`}
					>
						<nav className="flex flex-col text-sm text-neutral-600">
							{[
								['Reservas', '#reservas'],
								['Automatizaciones', '#automatizaciones'],
								['Integraciones', '#integraciones'],
								['Precios', '#precios'],
							].map(([label, href]) => (
								<a
									key={label}
									href={href}
									onClick={() => setIsMenuOpen(false)}
									className="rounded-xl px-3 py-2.5 transition-colors hover:bg-neutral-50 hover:text-neutral-950"
								>
									{label}
								</a>
							))}
							<div className="my-1 border-t border-neutral-100" />
							<a
								href="#"
								onClick={() => setIsMenuOpen(false)}
								className="rounded-xl px-3 py-2.5 transition-colors hover:bg-neutral-50 hover:text-neutral-950"
							>
								Acceder
							</a>
							<a
								href="#"
								onClick={() => setIsMenuOpen(false)}
								className="mt-1 rounded-xl bg-neutral-950 px-3 py-2.5 font-medium text-white transition-colors hover:bg-neutral-800"
							>
								Empezá Gratis <ArrowRight className="ml-1 inline size-3.5" />
							</a>
						</nav>
					</div>
				</div>
				<Button
					variant="ghost"
					size="icon-sm"
					className="hidden"
					aria-label="Abrir menú"
				>
					<Menu className="size-4" />
				</Button>
			</div>
		</header>
	);
}
