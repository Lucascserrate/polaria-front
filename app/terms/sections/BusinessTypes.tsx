'use client';

import { businessTypes } from '../data';
import { SectionEyebrow } from '../shared/Section';
import { useReveal } from '../shared/useReveal';

export function BusinessTypes() {
	const { ref, isVisible, reduceMotion } = useReveal<HTMLDivElement>();

	return (
		<section className="px-4 py-14 sm:px-6 lg:px-8">
			<div
				ref={ref}
				className={`mx-auto max-w-7xl rounded-[2rem] border border-neutral-200 bg-white p-6 transition-all duration-400 ease-out sm:p-8 motion-reduce:transition-none ${isVisible || reduceMotion ? 'translate-y-0 opacity-100' : 'translate-y-2.5 opacity-0'}`}
			>
				<SectionEyebrow>Para todo tipo de negocio basado en citas</SectionEyebrow>
				<div className="mt-5 flex flex-wrap gap-2">
					{businessTypes.map((item, index) => (
						<span
							key={item}
							className={`rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-700 transition-all duration-400 ease-out motion-reduce:transition-none ${isVisible || reduceMotion ? 'translate-y-0 opacity-100' : 'translate-y-2.5 opacity-0'}`}
							style={{ transitionDelay: `${index * 60}ms` }}
						>
							{item}
						</span>
					))}
				</div>
			</div>
		</section>
	);
}
