'use client';

import { Workflow } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';

import { steps } from './data';
import { SectionTitle } from './Section';
import { useReveal } from './useReveal';

function FlowCard({ index, step }: { index: number; step: (typeof steps)[number] }) {
	const { ref, isVisible, reduceMotion } = useReveal<HTMLDivElement>();

	return (
		<Card
			ref={ref}
			className={`rounded-[1.75rem] border-neutral-200 bg-white shadow-sm transition-all duration-[400ms] ease-out motion-reduce:transition-none ${isVisible || reduceMotion ? 'translate-y-0 opacity-100' : 'translate-y-[10px] opacity-0'}`}
			style={{ transitionDelay: `${index * 70}ms` }}
		>
			<CardContent className="p-5">
				<div className="flex items-center justify-between">
					<p className="text-xs font-medium tracking-[0.22em] text-neutral-500">
						{step.index}
					</p>
					<Workflow className="size-4 text-neutral-400" />
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

export function WhatsAppFlow() {
	return (
		<section id="integraciones" className="px-4 py-14 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<SectionTitle eyebrow="Cómo funciona WhatsApp" title="¿Cómo funciona la integración?" />
				<div className="mt-10 grid gap-4 lg:grid-cols-4">
					{steps.map((step, index) => (
						<FlowCard key={step.index} index={index} step={step} />
					))}
				</div>
			</div>
		</section>
	);
}
