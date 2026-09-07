import Link from 'next/link';

import { Logo } from '@/app/logo';

export function Footer() {
	return (
		<footer className="border-t border-neutral-200 bg-white px-4 py-10 sm:px-6 lg:px-8">
			<div className="mx-auto flex max-w-7xl flex-col gap-8 md:flex-row md:items-end md:justify-between">
				<div>
					<Logo tone="dark" className="text-[15px]" />
					<p className="mt-4 max-w-md text-sm leading-6 text-neutral-600">
						Desarrollado con pasión para Hispanoamérica.
					</p>
				</div>
				<div className="flex flex-wrap gap-5 text-sm text-neutral-600">
					<Link href="/terms-and-conditions" className="hover:text-neutral-950">Términos de servicio</Link>
					<Link href="/privacy" className="hover:text-neutral-950">Privacidad</Link>
					<Link href="/support" className="hover:text-neutral-950">Soporte</Link>
				</div>
			</div>
			<div className="mx-auto mt-8 flex max-w-7xl flex-col gap-2 border-t border-neutral-200 pt-6 text-xs text-neutral-500 md:flex-row md:items-center md:justify-between">
				<p>© 2026 Polaria Technologies Inc. Todos los derechos reservados.</p>
				<p>Diseñado para negocios que viven de las citas.</p>
			</div>
		</footer>
	);
}
