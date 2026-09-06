import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TermsAndConditionsPage() {
	return (
		<main className="min-h-screen bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
			<article className="mx-auto max-w-3xl rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-sm sm:p-10">
				<Link href="/terms" className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-950"><ArrowLeft className="size-4" />Volver a Polaria</Link>
				<p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-500">Información legal</p>
				<h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-4xl">Términos y condiciones de servicio</h1>
				<div className="mt-8 space-y-6 text-sm leading-7 text-neutral-600">
					<section><h2 className="text-lg font-medium text-neutral-950">1. Uso de Polaria</h2><p className="mt-2">Polaria ayuda a los negocios a gestionar reservas, clientes, servicios y horarios. Al utilizarla, te comprometes a proporcionar información correcta y mantener seguras tus credenciales.</p></section>
					<section><h2 className="text-lg font-medium text-neutral-950">2. Cuenta y responsabilidad</h2><p className="mt-2">Cada negocio es responsable de la información que registra y de las acciones realizadas desde su cuenta. No debes utilizar Polaria para fines ilegales ni acceder a datos de terceros sin autorización.</p></section>
					<section><h2 className="text-lg font-medium text-neutral-950">3. Servicio y cambios</h2><p className="mt-2">Trabajamos para mantener Polaria disponible y mejorar sus funciones. Las integraciones externas pueden estar sujetas a sus propias condiciones y disponibilidad. Publicaremos en esta página cualquier actualización de estos términos.</p></section>
				</div>
			</article>
		</main>
	);
}
