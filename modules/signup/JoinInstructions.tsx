'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

/**
 * Qué hacer cuando ya trabajás en un negocio que usa Polaria.
 *
 * Por ahora explica en lugar de resolver: el buscador de negocios y el pedido de
 * acceso son el paso siguiente. Y explicar ya arregla el problema de fondo, que
 * no era la falta de un buscador sino que Polaria creaba un negocio sin
 * preguntar: acá no se crea nada.
 *
 * Lo único que importa de esta pantalla es el correo, grande y copiable. Es el
 * dato exacto que el dueño tiene que cargar en Equipo, y la causa del incidente
 * fue justamente que se cargó otro —o ninguno—.
 */
const JoinInstructions: React.FC<{
	email: string | null;
	onBack: () => void;
}> = ({ email, onBack }) => {
	const [copied, setCopied] = useState(false);

	const copy = async () => {
		if (!email) return;

		try {
			await navigator.clipboard.writeText(email);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 2000);
		} catch {
			// Sin permiso de portapapeles queda a la vista para dictarlo, que es lo
			// que va a pasar igual: esto se resuelve por WhatsApp o en voz alta.
		}
	};

	return (
		<div className="space-y-5">
			<button
				type="button"
				onClick={onBack}
				className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="size-4" />
				Volver
			</button>

			<div className="space-y-2">
				<p className="text-sm font-medium">
					Pedile al negocio que te dé acceso con este correo:
				</p>

				{email ? (
					<div className="flex items-center gap-2">
						<p className="min-w-0 flex-1 overflow-x-auto rounded-lg border border-border bg-muted px-3 py-2.5 font-mono text-sm whitespace-nowrap">
							{email}
						</p>
						<Button
							variant="outline"
							size="icon"
							aria-label="Copiar el correo"
							title="Copiar el correo"
							onClick={() => void copy()}
						>
							{copied ? (
								<Check className="size-4" />
							) : (
								<Copy className="size-4" />
							)}
						</Button>
					</div>
				) : (
					/*
					 * Google no siempre entrega el correo. Sin él no hay nada que
					 * dictar, así que se dice qué hacer en su lugar.
					 */
					<p className="text-sm text-muted-foreground">
						No pudimos leer tu correo de Google. Pedile al negocio que te invite
						con el correo de la cuenta con la que entraste.
					</p>
				)}
			</div>

			<div className="space-y-2 rounded-xl border border-border px-4 py-3">
				<p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
					Cómo sigue
				</p>
				<ol className="list-decimal space-y-1 pl-4 text-sm text-muted-foreground">
					<li>El negocio te agrega en Equipo con ese correo.</li>
					<li>Volvés a entrar acá con Google.</li>
					<li>Entrás directo a su agenda.</li>
				</ol>
			</div>

			{/*
			 * Se dice que no se creó nada. Es la frase que faltaba: el empleado del
			 * incidente no tenía forma de saber que acababa de abrir un negocio.
			 */}
			<p className="text-xs text-muted-foreground">
				No se creó ninguna cuenta de negocio a tu nombre.
			</p>

			<Button asChild variant="outline" className="w-full">
				<Link href={ROUTES.auth}>Salir</Link>
			</Button>
		</div>
	);
};

export default JoinInstructions;
