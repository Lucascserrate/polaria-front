import { ArrowLeft, MessageCircleQuestion } from 'lucide-react';
import Link from 'next/link';

export default function SupportPage() {
	return (
		<main className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
			<section className="mx-auto max-w-2xl rounded-[2rem] border border-neutral-200 bg-white p-6 text-center shadow-sm sm:p-10">
				<Link
					href="/terms"
					className="mb-10 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-950"
				>
					<ArrowLeft className="size-4" />
					Volver a Polaria
				</Link>
				<div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-neutral-200 bg-neutral-50">
					<MessageCircleQuestion className="size-5 text-neutral-950" />
				</div>
				<h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] text-neutral-950">
					¿Necesitas ayuda?
				</h1>
				<p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-neutral-600">
					Estamos preparando el canal de soporte de Polaria. Mientras tanto,
					puedes consultar las preguntas frecuentes o volver al inicio.
				</p>
				<Link
					href="/terms#faq"
					className="mt-7 inline-flex h-10 items-center rounded-full bg-neutral-950 px-5 text-sm font-medium text-white hover:bg-neutral-800"
				>
					Ver preguntas frecuentes
				</Link>
			</section>
		</main>
	);
}
