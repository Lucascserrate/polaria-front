'use client';

import { Check } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

import { simpleSteps } from '../data';
import { SectionTitle } from '../shared/Section';
import { useReveal } from '../shared/useReveal';

function SimpleStepCard({
	index,
	step,
}: {
	index: number;
	step: (typeof simpleSteps)[number];
}) {
	const { ref, isVisible } = useReveal<HTMLDivElement>();

	return (
		<Card
			ref={ref}
			className={`rounded-[1.75rem] border-neutral-200 bg-white shadow-sm transition-all duration-400 ease-out motion-reduce:transition-none ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-2.5 opacity-0'}`}
			style={{ transitionDelay: `${index * 70}ms` }}
		>
			<CardContent className="p-5">
				<div className="flex items-center justify-between">
					<p className="text-xs font-medium tracking-[0.22em] text-neutral-500">
						{step.index}
					</p>
					<Check className="size-4 text-neutral-400" />
				</div>
				<h3 className="mt-6 text-lg font-medium tracking-[-0.03em] text-neutral-950">
					{step.title}
				</h3>
				<p className="mt-3 text-sm leading-6 text-neutral-600">
					{step.description}
				</p>
			</CardContent>
		</Card>
	);
}

export function SimpleSteps() {
	return (
		<section className="px-4 py-14 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<SectionTitle
					eyebrow="Empezá en minutos"
					title="Simple para vos y para tus clientes."
					description="Configurá tu negocio una vez y dejá que Polaria se encargue del resto."
				/>
				<div className="mt-10 grid gap-4 lg:grid-cols-3">
					{simpleSteps.map((step, index) => (
						<SimpleStepCard key={step.index} index={index} step={step} />
					))}
				</div>
			</div>
		</section>
	);
}
