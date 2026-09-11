'use client';

import { RotateCw } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

/**
 * Cómo se ve la página para un cliente.
 *
 * Es la pregunta que hoy sólo se podía contestar abriendo el enlace en otra
 * pestaña, y por eso casi nadie la contestaba: un negocio no sabía si sus fotos
 * se veían bien hasta que un cliente se lo decía.
 *
 * Va en ancho de teléfono y no a pantalla completa porque ahí se abre: el enlace
 * se comparte por WhatsApp y por Instagram, así que el único ancho que importa
 * es el del teléfono de quien reserva.
 */
const PublicPagePreview: React.FC<{ url: string }> = ({ url }) => {
	/*
	 * Recargar es cambiar la `key` del iframe, que lo desmonta y lo vuelve a
	 * montar. Tocarle el `src` no sirve: es otro origen, así que no se puede leer
	 * ni escribir su `contentWindow` desde acá.
	 */
	const [reloadKey, setReloadKey] = useState(0);

	return (
		<div className="space-y-3 rounded-xl border border-border p-4 sm:p-6">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="space-y-1">
					<h2 className="text-lg font-semibold">Así la ven tus clientes</h2>
					<p className="text-sm text-muted-foreground">
						Los cambios que hagas en fotos, servicios y horarios se ven acá.
					</p>
				</div>

				<Button
					variant="outline"
					size="sm"
					onClick={() => setReloadKey((current) => current + 1)}
				>
					<RotateCw className="size-4" />
					Actualizar
				</Button>
			</div>

			<div className="flex justify-center rounded-lg bg-muted/50 p-4">
				{/* Ancho de teléfono con alto fijo: la página scrollea adentro. */}
				<div className="w-full max-w-[390px] overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
					<iframe
						key={reloadKey}
						src={url}
						title="Vista previa de tu página de reservas"
						loading="lazy"
						className="h-[560px] w-full border-0"
					/>
				</div>
			</div>

			{/*
			 * La salida por si el marco queda en blanco.
			 *
			 * Un iframe de otro origen no avisa si el hosting lo bloquea —no hay
			 * evento que se pueda escuchar desde acá—, así que en vez de detectarlo
			 * queda siempre a mano la forma de verla de verdad.
			 */}
			<p className="text-center text-xs text-muted-foreground">
				¿No se ve nada acá?{' '}
				<a
					href={url}
					target="_blank"
					rel="noreferrer"
					className="underline underline-offset-4"
				>
					Abrila en una pestaña
				</a>
				.
			</p>
		</div>
	);
};

export default PublicPagePreview;
