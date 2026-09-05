import { businessTypes } from './data';
import { SectionEyebrow } from './Section';

export function BusinessTypes() {
	return (
		<section className="px-4 py-14 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<div className="rounded-[2rem] border border-neutral-200 bg-white p-6 sm:p-8">
					<SectionEyebrow>
						Para todo tipo de negocio basado en citas
					</SectionEyebrow>
					<div className="mt-5 flex flex-wrap gap-2">
						{businessTypes.map((item) => (
							<span
								key={item}
								className="rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-700"
							>
								{item}
							</span>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
