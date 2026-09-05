import { CheckCheck, MessageSquareText } from 'lucide-react';

import AnimatedWhatsappDemo from '@/components/landing/AnimatedWhatsappDemo';
import { whatsappMessages } from './data';
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
				<div className="mx-auto w-full max-w-md rounded-[2rem] border border-emerald-200 bg-white p-3 shadow-[0_24px_70px_rgba(15,118,110,0.12)]">
					<AnimatedWhatsappDemo />
					<div className="hidden rounded-[1.6rem] bg-[#efeae2] p-3 text-neutral-950">
						<div className="flex items-center gap-3 rounded-t-2xl bg-[#075e54] px-3 py-3 text-white">
							<div className="flex size-9 items-center justify-center rounded-full bg-white/15 text-white">
								<MessageSquareText className="size-5" />
							</div>
							<div>
								<p className="text-sm font-medium">Studio Norte</p>
								<p className="text-xs text-white/70">
									en línea · Asistente Polaria
								</p>
							</div>
						</div>
						<div className="space-y-2.5 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.8),transparent_35%)] px-1 py-4">
							{whatsappMessages.map((message, index) => (
								<div
									key={`${message.from}-${index}`}
									className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-sm leading-6 ${message.bubble === 'bubble-green' ? 'ml-auto bg-[#d9fdd3] text-neutral-900 shadow-sm' : 'bg-white text-neutral-900 shadow-sm'}`}
								>
									<p className="mb-1 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400">
										{message.from}
									</p>
									<p className="whitespace-pre-line">{message.text}</p>
									{message.bubble === 'bubble-green' && (
										<div className="mt-1 flex justify-end text-[10px] text-neutral-400">
											10:32{' '}
											<CheckCheck className="ml-1 size-3.5 text-sky-600" />
										</div>
									)}
								</div>
							))}
						</div>
						<div className="flex items-center gap-2 rounded-b-2xl bg-white px-3 py-2 text-xs text-neutral-400">
							<span className="size-2 rounded-full bg-[#25d366]" /> Reserva
							creada en la agenda de Studio Norte
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
