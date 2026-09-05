import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { features } from './data';
import { SectionTitle } from './Section';

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
					{features.map((feature) => {
						const Icon = feature.icon;
						return (
							<Card
								key={feature.title}
								className="rounded-[1.75rem] border-neutral-200 bg-white shadow-sm transition-transform duration-200 hover:-translate-y-1 hover:shadow-md"
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
					})}
				</div>
			</div>
		</section>
	);
}
