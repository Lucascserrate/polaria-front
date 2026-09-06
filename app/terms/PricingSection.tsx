import Link from 'next/link';

import { BadgeCheck, CircleCheckBig } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { SectionTitle } from './Section';

const plans = [
	{
		name: 'Free',
		price: '$0',
		description: 'Para probar Polaria y empezar a ordenar tu operación.',
		features: [
			'Hasta 30 reservas por mes',
			'Link público de reservas',
			'Panel básico de agenda',
			'Soporte por email',
		],
		cta: 'Crear cuenta gratis',
		href: '/signup',
		featured: false,
	},
	{
		name: 'Pro',
		price: '$29',
		description: 'Para negocios que ya venden turnos todos los días.',
		features: [
			'Reservas ilimitadas',
			'Automatizaciones por WhatsApp',
			'Recordatorios y confirmaciones',
			'Integraciones básicas',
		],
		cta: 'Empezar gratis',
		href: '/signup',
		featured: true,
	},
	{
		name: 'Business',
		price: '$79',
		description: 'Para equipos con más volumen y varias sucursales.',
		features: [
			'Multi-sucursal',
			'Roles y permisos de equipo',
			'Reportes avanzados',
			'Soporte prioritario',
		],
		cta: 'Ver demo en vivo',
		href: '/demo',
		featured: false,
	},
] as const;

export function PricingSection() {
	return (
		<section id="precios" className="px-4 py-14 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<SectionTitle
					eyebrow="Precios"
					title="Planes simples, pensados para crecer contigo."
					description="Elige el nivel que acompaña a tu negocio hoy y cambia de plan cuando necesites más volumen o automatización."
				/>
				<div className="mt-10 grid gap-4 lg:grid-cols-3">
					{plans.map((plan) => (
						<Card
							key={plan.name}
							className={`rounded-[2rem] border-neutral-200 bg-white shadow-sm ${plan.featured ? 'border-neutral-950 shadow-[0_24px_70px_rgba(0,0,0,0.08)]' : ''}`}
						>
							<CardHeader className="space-y-4 px-5 pt-5">
								<div className="flex items-start justify-between gap-4">
									<div>
										<CardTitle className="text-lg text-neutral-950">
											{plan.name}
										</CardTitle>
										<CardDescription className="mt-2 text-sm leading-6 text-neutral-600">
											{plan.description}
										</CardDescription>
									</div>
									{plan.featured && (
										<span className="rounded-full bg-neutral-950 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white">
											Más elegido
										</span>
									)}
								</div>
								<div className="flex items-end gap-2">
									<p className="text-4xl font-semibold tracking-[-0.05em] text-neutral-950">
										{plan.price}
									</p>
									<p className="pb-1 text-sm text-neutral-500">/ mes</p>
								</div>
							</CardHeader>
							<CardContent className="px-5 pb-5">
								<div className="space-y-3 border-t border-neutral-200 pt-5">
									{plan.features.map((feature) => (
										<div key={feature} className="flex items-start gap-3">
											<CircleCheckBig className="mt-0.5 size-4 text-neutral-950" />
											<p className="text-sm leading-6 text-neutral-600">
												{feature}
											</p>
										</div>
									))}
								</div>
								<Button
									asChild
									className={`mt-6 h-11 w-full rounded-full px-6 ${plan.featured ? 'bg-neutral-950 text-white hover:bg-neutral-800' : ''}`}
									variant={plan.featured ? 'default' : 'outline'}
								>
									<Link href={plan.href}>{plan.cta}</Link>
								</Button>
								{plan.name === 'Free' && (
									<p className="mt-3 flex items-center gap-2 text-xs text-neutral-500">
										<BadgeCheck className="size-3.5 text-neutral-950" />
										Sin tarjeta de crédito
									</p>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</section>
	);
}
