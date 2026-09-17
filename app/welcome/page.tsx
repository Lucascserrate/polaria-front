'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Building2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { ROUTES } from '@/constants/routes';
import { StarGlyph } from '../logo';
import useCreateBusiness from '@/services/signup/useCreateBusiness';
import useSignupSession from '@/services/signup/useSignupSession';
import JoinInstructions from '@/modules/signup/JoinInstructions';

/**
 * Qué querés hacer en Polaria: crear un negocio, o entrar al de alguien.
 *
 * Existe por un incidente concreto. El login creaba el negocio cuando no
 * encontraba ninguno, así que un empleado al que todavía no le habían cargado el
 * acceso entró con Google y se fue con una peluquería vacía a su nombre. Y peor:
 * ese negocio se quedó con su correo, con lo cual el dueño ya no podía
 * invitarlo —`grantAccess` lo rechaza como correo de otra cuenta— y hubo que
 * borrarlo a mano.
 *
 * Así que crear un negocio dejó de ser el efecto secundario de autenticarse. La
 * pregunta se hace una sola vez, la primera: quien ya tiene negocio o ficha de
 * equipo entra derecho y nunca ve esta pantalla.
 */
const WelcomePage = () => {
	const { data, isLoading, isError } = useSignupSession();
	const { mutateAsync: create, isPending } = useCreateBusiness();
	const [choice, setChoice] = useState<'join' | null>(null);
	const [error, setError] = useState<string | null>(null);

	const handleCreate = async () => {
		setError(null);

		try {
			await create();

			/*
			 * Recarga entera y no navegación: el servidor acaba de cambiar la cookie
			 * del trámite por las de sesión, y todo lo que ya existe —el cliente de
			 * React Query, el menú, la configuración inicial— tiene que arrancar
			 * leyendo una sesión de dueño en lugar de la memoria de esta pantalla.
			 */
			window.location.href = ROUTES.setup;
		} catch {
			setError('No pudimos crear tu negocio. Probá de nuevo.');
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#f7fafc_0%,#eef2ff_38%,#ffffff_100%)] p-4 dark:bg-[radial-gradient(circle_at_top,#141a2b_0%,#101527_38%,#08090f_100%)]">
			<div className="w-full max-w-md rounded-3xl border border-border bg-card/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
				<div className="mb-8 text-center">
					<div className="mb-2 flex items-center justify-center gap-2">
						<StarGlyph className="h-6 w-6" />
						<h1 className="text-3xl font-semibold text-foreground">Polaria</h1>
					</div>
					<p className="text-muted-foreground">
						{data?.name ? `Hola, ${data.name}.` : 'Ya casi.'} ¿Cómo vas a usar
						Polaria?
					</p>
				</div>

				{/*
				 * Mientras no se sabe quién entró no se ofrece nada.
				 *
				 * Las dos opciones necesitan el correo —una para crear el negocio con
				 * él, la otra para mostrarlo—, y dibujarlas antes dejaría elegir a
				 * ciegas y, si el trámite venció, elegir algo que va a fallar.
				 */}
				{isLoading ? (
					<div className="space-y-3">
						<div className="h-20 animate-pulse rounded-2xl bg-muted" />
						<div className="h-20 animate-pulse rounded-2xl bg-muted" />
					</div>
				) : isError ? (
					<Expired />
				) : choice === 'join' ? (
					<JoinInstructions
						email={data?.email ?? null}
						onBack={() => setChoice(null)}
					/>
				) : (
					<div className="space-y-3">
						<Choice
							icon={<Building2 className="size-5" />}
							title="Crear una cuenta de negocio"
							description="Administrá tu negocio en Polaria."
							busy={isPending}
							onClick={() => void handleCreate()}
						/>

						<Choice
							icon={<Users className="size-5" />}
							title="Unirme a un negocio"
							description="Ya trabajo en uno que usa Polaria."
							onClick={() => setChoice('join')}
						/>

						{error && (
							<p
								role="alert"
								className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-destructive"
							>
								{error}
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

/** Una de las dos salidas. Alta y tocable: se elige una vez y define todo. */
const Choice: React.FC<{
	icon: React.ReactNode;
	title: string;
	description: string;
	busy?: boolean;
	onClick: () => void;
}> = ({ icon, title, description, busy, onClick }) => (
	<button
		type="button"
		disabled={busy}
		onClick={onClick}
		className="flex w-full items-center gap-4 rounded-2xl border border-border px-4 py-4 text-left transition-colors hover:bg-accent disabled:opacity-60"
	>
		<span className="shrink-0 text-muted-foreground">{icon}</span>

		<span className="min-w-0 flex-1">
			<span className="block text-sm font-medium">{title}</span>
			<span className="block text-xs text-muted-foreground">{description}</span>
		</span>

		{busy ? (
			<Spinner className="size-4 shrink-0" />
		) : (
			<ArrowRight className="size-4 shrink-0 text-muted-foreground" />
		)}
	</button>
);

/**
 * El trámite venció, o nunca hubo uno.
 *
 * Es lo que se ve al abrir `/welcome` a mano o media hora después de entrar. No
 * se dice "error": no se rompió nada, hay que volver a identificarse.
 */
const Expired: React.FC = () => (
	<div className="space-y-4 text-center">
		<p className="text-sm text-muted-foreground">
			Pasó demasiado tiempo desde que entraste. Volvé a identificarte para
			seguir.
		</p>
		<Button asChild className="w-full">
			<Link href={ROUTES.auth}>Volver a entrar</Link>
		</Button>
	</div>
);

export default WelcomePage;
