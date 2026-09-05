import { Button } from '@/components/ui/button';

export function FinalCTA() {
	return (
		<section className="px-4 py-14 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl overflow-hidden rounded-[2.25rem] border border-neutral-200 bg-neutral-950 px-6 py-14 text-center text-white sm:px-10 lg:px-16">
				<p className="text-[11px] font-medium uppercase tracking-[0.24em] text-white/45">
					Empezá hoy
				</p>
				<h2 className="mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">
					Empezá a organizar tu negocio hoy.
				</h2>
				<p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
					Únete a cientos de salones, barberías y clínicas que ya confían en
					Polaria para escalar su negocio. Sin tarjetas de crédito requeridas.
				</p>
				<div className="mt-8">
					<Button className="h-11 rounded-full bg-white px-6 text-neutral-950 hover:bg-neutral-200">
						Crear cuenta gratis
					</Button>
				</div>
			</div>
		</section>
	);
}
