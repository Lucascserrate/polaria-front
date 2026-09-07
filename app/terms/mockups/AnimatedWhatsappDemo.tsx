'use client';

import { useEffect, useRef, useState } from 'react';
import {
	CheckCheck,
	MessageSquareText,
	MoreVertical,
	Phone,
	Video,
} from 'lucide-react';

type DemoOption = { id: string; label: string };
type DemoMessage = {
	id: string;
	sender: 'user' | 'assistant';
	text: string;
	options?: DemoOption[];
};

const demoFlow: DemoMessage[] = [
	{ id: 'hello', sender: 'user', text: 'Hola buenas noches' },
	{
		id: 'welcome',
		sender: 'assistant',
		text: '¡Hola! 👋 Soy el asistente de Studio Norte. ¿En qué puedo ayudarte?',
	},
	{
		id: 'start-options',
		sender: 'assistant',
		text: 'Elegí una opción para comenzar:',
		options: [
			{ id: 'book', label: 'Agendar una cita' },
			{ id: 'human', label: 'Hablar con alguien' },
		],
	},
	{ id: 'book-selected', sender: 'user', text: 'Agendar una cita' },
	{
		id: 'service-options',
		sender: 'assistant',
		text: '¡Perfecto! ✂️ ¿Qué servicio querés reservar?',
		options: [
			{ id: 'cut-beard', label: 'Corte + Barba · Bs 40' },
			{ id: 'cut', label: 'Corte clásico · Bs 25' },
			{ id: 'beard', label: 'Barba · Bs 20' },
		],
	},
	{ id: 'service-selected', sender: 'user', text: 'Corte + Barba' },
	{
		id: 'date-options',
		sender: 'assistant',
		text: '¿Qué día querés tu cita?',
		options: [
			{ id: 'today', label: 'Hoy' },
			{ id: 'tomorrow', label: 'Mañana' },
			{ id: 'other', label: 'Ver otros días' },
		],
	},
	{ id: 'date-selected', sender: 'user', text: 'Mañana' },
	{
		id: 'slot-options',
		sender: 'assistant',
		text: 'Estos son los horarios disponibles:',
		options: [
			{ id: 'nine', label: '09:00' },
			{ id: 'eleven', label: '11:30' },
			{ id: 'sixteen', label: '16:30' },
		],
	},
	{ id: 'slot-selected', sender: 'user', text: '16:30' },
	{
		id: 'confirm',
		sender: 'assistant',
		text: 'Revisá tu cita antes de confirmarla:\n\nCorte + Barba (50 min)\nMañana · 16:30\nProfesional: Carlos',
		options: [
			{ id: 'confirm', label: 'Confirmar' },
			{ id: 'change', label: 'Cambiar horario' },
		],
	},
	{ id: 'confirmed', sender: 'user', text: 'Confirmar' },
	{
		id: 'completed',
		sender: 'assistant',
		text: '¡Listo! 🎉 Tu cita quedó agendada.\n\nCorte + Barba · mañana 16:30\nCarlos te espera en Studio Norte.',
	},
];

const stageDelay = (message: DemoMessage) =>
	message.options ? 1450 : message.sender === 'user' ? 850 : 1100;

// Resumen estático para lectores de pantalla: la animación es decorativa
// y repite en loop, así que no debe leerse mensaje a mensaje.
const srSummary =
	'Demostración animada de una conversación de WhatsApp con el asistente de ' +
	'Studio Norte: el cliente agenda un corte de cabello con barba para el día ' +
	'siguiente a las 16:30 y confirma la cita.';

export default function AnimatedWhatsappDemo() {
	const [visibleCount, setVisibleCount] = useState(1);
	const [fading, setFading] = useState(false);
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	// Hora fija de la maqueta para evitar mismatch de hidratación en Next.js.
	const timestamp = '10:32';
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (fading) {
			const resetTimer = window.setTimeout(() => {
				setVisibleCount(1);
				setSelectedOption(null);
				setFading(false);
			}, 550);
			return () => window.clearTimeout(resetTimer);
		}
		const current = demoFlow[visibleCount - 1];
		const finished = visibleCount >= demoFlow.length;
		let selectionTimer: number | undefined;
		const timer = window.setTimeout(
			() => {
				if (finished) {
					setFading(true);
					return;
				}
				if (current.options) {
					setSelectedOption(current.options[0].id);
					selectionTimer = window.setTimeout(() => {
						setSelectedOption(null);
						setVisibleCount((count) => count + 1);
					}, 350);
					return;
				}
				setVisibleCount((count) => count + 1);
			},
			finished ? 3000 : stageDelay(current),
		);
		return () => {
			window.clearTimeout(timer);
			if (selectionTimer) window.clearTimeout(selectionTimer);
		};
	}, [fading, visibleCount]);

	useEffect(() => {
		const frame = window.requestAnimationFrame(() => {
			if (scrollRef.current) {
				scrollRef.current.scrollTo({
					top: scrollRef.current.scrollHeight,
					behavior: 'smooth',
				});
			}
		});
		return () => window.cancelAnimationFrame(frame);
	}, [visibleCount]);

	const showTyping = !fading && demoFlow[visibleCount]?.sender === 'assistant';

	return (
		<div
			role="img"
			aria-label={srSummary}
			className={`mx-auto flex h-145 w-[min(100%,320px)] flex-col overflow-hidden rounded-[2rem] border-[7px] border-neutral-900 bg-[#efeae2] shadow-[0_24px_70px_rgba(15,118,110,0.16)] transition-opacity duration-500 ${fading ? 'opacity-0' : 'opacity-100'}`}
		>
			{/*
			 * Keyframes propios: no dependen del plugin tailwindcss-animate,
			 * así que la animación funciona aunque ese plugin no esté instalado.
			 */}
			<style>{`
				@keyframes waMessageIn {
					from { opacity: 0; transform: translateY(10px); }
					to { opacity: 1; transform: translateY(0); }
				}
				@keyframes waTypingDot {
					0%, 60%, 100% { transform: translateY(0); opacity: .4; }
					30% { transform: translateY(-3px); opacity: 1; }
				}
				@media (prefers-reduced-motion: reduce) {
					.wa-message-in, .wa-typing-dot { animation: none !important; }
				}
			`}</style>

			<div className="flex shrink-0 items-center gap-2.5 bg-[#075e54] px-3 py-3 text-white">
				<div className="flex size-8 items-center justify-center rounded-full bg-white/15">
					<MessageSquareText className="size-4" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="truncate text-xs font-semibold">Studio Norte</p>
					<p className="text-[10px] text-white/70">
						en línea · Asistente Polaria
					</p>
				</div>
				<Video className="size-3.5 text-white/70" />
				<Phone className="size-3.5 text-white/70" />
				<MoreVertical className="size-4 text-white/70" />
			</div>
			<div
				ref={scrollRef}
				aria-hidden="true"
				className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,.78),transparent_35%)] px-2.5 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				<div className="space-y-2">
					{demoFlow.slice(0, visibleCount).map((message, index) => {
						const isUser = message.sender === 'user';
						const isLatest = index === visibleCount - 1;
						return (
							<div
								key={message.id}
								className={`wa-message-in flex ${isUser ? 'justify-end' : 'justify-start'}`}
								style={
									isLatest
										? { animation: 'waMessageIn 0.32s ease-out both' }
										: undefined
								}
							>
								<div
									className={`max-w-[88%] rounded-[1.1rem] px-3 py-2 text-[11px] leading-4 shadow-sm ${isUser ? 'rounded-tr-sm bg-[#d9fdd3] text-neutral-900' : 'rounded-tl-sm bg-white text-neutral-900'}`}
								>
									<p className="whitespace-pre-line">{message.text}</p>
									{message.options && (
										<div className="mt-2 space-y-1.5 border-t border-neutral-900/10 pt-2">
											{message.options.map((option) => (
												<div
													key={option.id}
													className={`rounded-lg border border-[#8bcf86]/60 bg-[#f5fff3] px-2.5 py-1.5 text-[10px] font-medium text-[#075e54] transition-all duration-300 ${selectedOption === option.id ? 'scale-[0.97] bg-[#c9f4c2] opacity-70' : ''}`}
												>
													{option.label}
												</div>
											))}
										</div>
									)}
									<div className="mt-1 flex justify-end text-[9px] text-neutral-400">
										{timestamp}{' '}
										{isUser && (
											<CheckCheck className="ml-1 size-3 text-sky-600" />
										)}
									</div>
								</div>
							</div>
						);
					})}
					{showTyping && (
						<div
							className="wa-message-in flex justify-start"
							style={{ animation: 'waMessageIn 0.25s ease-out both' }}
						>
							<div className="rounded-[1.1rem] rounded-tl-sm bg-white px-3.5 py-2.5 shadow-sm">
								<div className="flex items-center gap-1">
									<span
										className="wa-typing-dot size-1.5 rounded-full bg-neutral-400"
										style={{ animation: 'waTypingDot 1s ease-in-out infinite' }}
									/>
									<span
										className="wa-typing-dot size-1.5 rounded-full bg-neutral-400"
										style={{
											animation: 'waTypingDot 1s ease-in-out infinite',
											animationDelay: '150ms',
										}}
									/>
									<span
										className="wa-typing-dot size-1.5 rounded-full bg-neutral-400"
										style={{
											animation: 'waTypingDot 1s ease-in-out infinite',
											animationDelay: '300ms',
										}}
									/>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
			<div
				aria-hidden="true"
				className="flex shrink-0 items-center gap-2 border-t border-neutral-200/80 bg-white px-2.5 py-2"
			>
				<div className="flex-1 rounded-full bg-neutral-100 px-3 py-1.5 text-[10px] text-neutral-400">
					Escribe un mensaje
				</div>
				<div className="flex size-7 items-center justify-center rounded-full bg-[#075e54] text-sm text-white">
					↑
				</div>
			</div>
			<div
				aria-hidden="true"
				className="flex shrink-0 items-center gap-2 bg-white px-3 py-1.5 text-[9px] text-neutral-400"
			>
				<span className="size-1.5 rounded-full bg-[#25d366]" /> Reserva creada
				en la agenda de Studio Norte
			</div>
		</div>
	);
}
