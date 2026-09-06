import AnimatedWhatsappDemo from '@/app/terms/AnimatedWhatsappDemo';
import { SectionEyebrow } from './Section';

export function WhatsAppSection() {
	return (
		<section id="reservas" className="px-4 py-14 sm:px-6 lg:px-8">
			<div className="mx-auto grid max-w-7xl gap-10 rounded-[2.25rem] border border-emerald-200/60 bg-[#f4faf5] p-5 sm:p-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
				<div>
					<SectionEyebrow>Reservas por WhatsApp</SectionEyebrow>
					<h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-5xl">
						Reservas por WhatsApp, automáticas.
					</h2>
					<p className="mt-4 max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
						Deja que Polaria responda y agende por ti las 24 horas del día. Tus
						clientes obtienen respuestas al instante sin que tengas que tocar tu
						celular.
					</p>
				</div>
				<div className="mx-auto w-full max-w-md">
					<AnimatedWhatsappDemo />
				</div>
			</div>
		</section>
	);
}
