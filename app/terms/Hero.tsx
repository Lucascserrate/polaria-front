'use client';

import { ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { SectionEyebrow } from './Section';

export function Hero() {
	return (
		<section className="relative overflow-hidden">
			<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.06),transparent_42%),linear-gradient(to_bottom,rgba(255,255,255,1),rgba(250,250,250,1))]" />
			<div className="mx-auto max-w-7xl px-4 pb-10 pt-16 sm:px-6 sm:pb-16 sm:pt-24 lg:px-8 lg:pb-20 lg:pt-28">
				<div className="mx-auto max-w-4xl text-center">
					<SectionEyebrow>
						El nuevo estándar para negocios de turnos
					</SectionEyebrow>
					<h1 className="hero-title mx-auto mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.06em] text-neutral-950 opacity-0 sm:text-6xl lg:text-7xl">
						Tu negocio, organizado.
						<br />
						Tus clientes, atendidos.
					</h1>
					<p className="hero-copy mx-auto mt-6 max-w-2xl text-sm leading-7 text-neutral-600 opacity-0 sm:text-base">
						Polaria ayuda a salones de belleza, barberías, spas, clínicas y más
						a automatizar sus reservas, gestionar sus equipos de trabajo y
						fidelizar clientes desde una sola herramienta.
					</p>
					<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
						<Button className="hero-primary-btn h-11 rounded-full bg-neutral-950 px-6 text-white transition-transform duration-300 ease-out hover:scale-[1.02] hover:bg-neutral-800 active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:scale-100">
							Empezar gratis
							<ArrowRight className="ml-1 size-4" />
						</Button>
						<Button
							variant="outline"
							className="hero-secondary-btn h-11 rounded-full border-neutral-300 px-6 transition-transform duration-300 ease-out hover:scale-[1.02] hover:bg-neutral-50 active:scale-[0.99] motion-reduce:transition-none motion-reduce:hover:scale-100"
						>
							Ver demo en vivo
						</Button>
					</div>
				</div>
			</div>
			<style>{`
				.hero-title,
				.hero-copy,
				.hero-primary-btn,
				.hero-secondary-btn {
					animation: heroFadeUp 480ms ease-out forwards;
				}

				.hero-copy {
					animation-delay: 120ms;
				}

				.hero-primary-btn {
					animation-delay: 240ms;
				}

				.hero-secondary-btn {
					animation-delay: 340ms;
				}

				@keyframes heroFadeUp {
					from {
						opacity: 0;
						transform: translateY(10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}

				@media (prefers-reduced-motion: reduce) {
					.hero-title,
					.hero-copy,
					.hero-primary-btn,
					.hero-secondary-btn {
						animation: none !important;
						opacity: 1 !important;
						transform: none !important;
					}
				}
			`}</style>
		</section>
	);
}
