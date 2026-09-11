'use client';

import { useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';

/**
 * El enlace de la página pública, para copiar y pegar donde haga falta.
 *
 * Es de sólo lectura a propósito: el slug se asigna una vez a partir del nombre
 * y no cambia aunque el negocio se renombre, porque el enlace ya está pegado en
 * un QR sobre el mostrador y en la biografía de Instagram. Un campo editable
 * acá sería una forma silenciosa de romper todo eso.
 */
const BookingLinkCard: React.FC<{ url: string | null }> = ({ url }) => {
	const [copied, setCopied] = useState(false);

	/*
	 * Sin slug todavía no hay página, y el motivo es concreto: se asigna cuando el
	 * negocio guarda su nombre real. Decirlo con el camino para resolverlo, en
	 * lugar de mostrar una tarjeta vacía que parece un error del sistema.
	 */
	if (!url) {
		return (
			<div className="rounded-xl border border-dashed border-border p-6 text-center">
				<p className="text-sm font-medium">Tu página todavía no existe.</p>
				<p className="mt-1 text-sm text-muted-foreground">
					La dirección se arma con el nombre de tu negocio. Guardalo y el enlace
					queda listo.
				</p>
				<Button asChild variant="outline" size="sm" className="mt-4">
					<Link href={ROUTES.settingsBusiness}>Poner el nombre</Link>
				</Button>
			</div>
		);
	}

	const copy = async () => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// Sin permiso de portapapeles queda el enlace a la vista para copiarlo
			// a mano, que es lo que hace la mayoría igual.
		}
	};

	return (
		<div className="space-y-3 rounded-xl border border-border p-4 sm:p-6">
			<div className="space-y-1">
				<h2 className="text-lg font-semibold">Tu enlace</h2>
				<p className="text-sm text-muted-foreground">
					Compartilo por WhatsApp, en tu perfil de Instagram o en un QR: tus
					clientes reservan desde ahí sin escribirte.
				</p>
			</div>

			<p className="overflow-x-auto rounded-lg border border-border bg-muted px-3 py-2.5 font-mono text-sm whitespace-nowrap">
				{url}
			</p>

			<div className="flex flex-wrap gap-2">
				<Button onClick={() => void copy()}>
					{copied ? <Check className="size-4" /> : <Copy className="size-4" />}
					{copied ? 'Copiado' : 'Copiar enlace'}
				</Button>

				<Button asChild variant="outline">
					<a href={url} target="_blank" rel="noreferrer">
						<ExternalLink className="size-4" />
						Abrir
					</a>
				</Button>
			</div>
		</div>
	);
};

export default BookingLinkCard;
