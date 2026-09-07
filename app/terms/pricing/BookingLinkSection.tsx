import { Button } from '@/components/ui/button';
import { SectionTitle } from '../shared/Section';

export function BookingLinkSection() {
	return (
		<section id="precios" className="px-4 py-14 sm:px-6 lg:px-8">
			<div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
				<div>
					<SectionTitle
						eyebrow="Link de reservas"
						title="Tu link de reservas. Compartilo en todas tus redes."
						description="Crea una página de reserva pública y atractiva. Tus clientes podrán ver tus servicios disponibles, elegir profesional y agendar en menos de 1 minuto."
					/>
				</div>
				<div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
					<div className="border-b border-neutral-200 bg-neutral-950 px-5 py-4 text-white">
						<p className="text-xs uppercase tracking-[0.24em] text-white/50">
							polariahq.com/tunegocio
						</p>
						<p className="mt-2 text-lg font-medium">Studio Norte</p>
					</div>
					<div className="p-5">
						<div className="rounded-[1.5rem] border border-neutral-200 bg-neutral-50 p-4">
							<p className="text-sm text-neutral-500">
								Salón de Belleza & Estética
							</p>
							<div className="mt-4 space-y-3">
								{[
									{
										name: 'Corte de Cabello Premium',
										price: '$25.00',
										time: '45 min',
									},
									{
										name: 'Perfilado de Barba + Ritual',
										price: '$15.00',
										time: '30 min',
									},
									{
										name: 'Manicura Rusa Express',
										price: '$20.00',
										time: '40 min',
									},
								].map((service) => (
									<div
										key={service.name}
										className="rounded-2xl border border-neutral-200 bg-white p-4"
									>
										<div className="flex items-start justify-between gap-4">
											<div>
												<p className="font-medium text-neutral-950">
													{service.name}
												</p>
												<div className="mt-1 flex items-center gap-3 text-sm text-neutral-500">
													<span>{service.price}</span>
													<span>{service.time}</span>
												</div>
											</div>
											<Button
												variant="outline"
												size="sm"
												className="rounded-full border-neutral-300"
											>
												Elegir
											</Button>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
