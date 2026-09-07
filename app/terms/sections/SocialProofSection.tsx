import { Card, CardContent } from '@/components/ui/card';
import { SectionTitle } from '../shared/Section';

const testimonials = [
	{
		name: 'Mariana R.',
		business: 'Studio Norte',
		quote:
			'Pasamos de responder mensajes todo el día a tener la agenda ordenada en minutos.',
	},
	{
		name: 'Diego M.',
		business: 'Clínica Sonrisa',
		quote:
			'La migración fue sencilla y el equipo entendió el sistema en una tarde.',
	},
	{
		name: 'Sofía L.',
		business: 'Spa Aura',
		quote:
			'Los recordatorios nos bajaron muchísimo las ausencias sin meter fricción al cliente.',
	},
] as const;

export function SocialProofSection() {
	return (
		<section className="px-4 py-14 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl">
				<SectionTitle
					eyebrow="Prueba social"
					title="Negocios reales que ya usan Polaria."
					description="Historias cortas de equipos que ordenaron reservas, mejoraron su atención y redujeron el trabajo manual."
				/>
				<div className="mt-10 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
					<div className="grid gap-4 md:grid-cols-3">
						{testimonials.map((testimonial) => (
							<Card
								key={testimonial.name}
								className="rounded-[2rem] border-neutral-200 bg-white shadow-sm"
							>
								<CardContent className="p-5">
									<p className="text-sm leading-6 text-neutral-600">
										&quot;{testimonial.quote}&quot;
									</p>
									<div className="mt-6">
										<p className="text-sm font-medium text-neutral-950">
											{testimonial.name}
										</p>
										<p className="mt-1 text-xs text-neutral-500">
											{testimonial.business}
										</p>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
					<Card className="rounded-[2rem] border-neutral-200 bg-neutral-950 text-white shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
						<CardContent className="p-6 sm:p-8">
							<p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/45">
								Comunidad
							</p>
							<p className="mt-4 text-5xl font-semibold tracking-[-0.06em]">
								250+
							</p>
							<p className="mt-3 max-w-sm text-sm leading-7 text-white/70">
								Negocios de belleza, salud y bienestar usando Polaria para
								gestionar reservas, clientes y WhatsApp en un solo lugar.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</section>
	);
}
