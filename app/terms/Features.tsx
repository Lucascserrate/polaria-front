'use client';

import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

import { features } from './data';
import { SectionTitle } from './Section';
import { useReveal } from './useReveal';

function FeatureCard({ index, feature }: { index: number; feature: (typeof features)[number] }) {
	const { ref, isVisible, reduceMotion } = useReveal<HTMLDivElement>();
	const Icon = feature.icon;

	return (
		<Card
			ref={ref}
			className={`rounded-[1.75rem] border-neutral-200 bg-white shadow-sm transition-all duration-[400ms] ease-out motion-reduce:transition-none ${isVisible || reduceMotion ? 'translate-y-0 opacity-100' : 'translate-y-[10px] opacity-0'}`}
			style={{ transitionDelay: `${index * 70}ms` }}
		>
			<CardHeader className="space-y-4 px-5 pt-5">
				<div className="flex size-11 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50">
					<Icon className="size-5 text-neutral-950" />
				</div>
				<div>
					<CardTitle className="text-lg text-neutral-950">
						{feature.title}
					</CardTitle>
					<CardDescription className="mt-2 text-sm leading-6 text-neutral-600">
						{feature.description}
					</CardDescription>
				</div>
			</CardHeader>
		</Card>
	);
}

export function Features() {
	return (
		<section id="automatizaciones" className="px-4 py-14 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<SectionTitle
					eyebrow="Funcionalidades"
					title="Todo lo que necesitás para gestionar tu negocio."
					description="Automatiza tareas administrativas repetitivas y enfócate en lo que mejor sabes hacer."
				/>
				<div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{features.map((feature, index) => (
						<FeatureCard key={feature.title} index={index} feature={feature} />
					))}
				</div>
			</div>
		</section>
	);
}
