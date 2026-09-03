'use client';

import GoogleButton from '@/components/GoogleButton';
import { StarGlyph } from '../logo';
import Link from 'next/link';

const AuthPage = () => {
	/*
	 * El degradado del fondo va escrito dos veces en lugar de salir de las
	 * variables del tema porque el tinte azul es de marca y no de superficie: con
	 * `--muted` y `--accent`, que son grises, la pantalla de entrada perdería lo
	 * único que la distingue de una hoja en blanco.
	 */
	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,#f7fafc_0%,#eef2ff_38%,#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top,#141a2b_0%,#101527_38%,#08090f_100%)] flex items-center justify-center p-4">
			<div className="w-full max-w-md rounded-3xl border border-border bg-card/90 backdrop-blur shadow-[0_24px_80px_rgba(15,23,42,0.12)] p-8">
				<div className="text-center mb-8">
					<div className="flex justify-center items-center gap-2 mb-2">
						<StarGlyph className="w-6 h-6" />
						<h1 className="text-3xl font-semibold text-foreground ">Polaria</h1>
					</div>
					<p className="text-muted-foreground">
						Tu asistente de reserva inteligente.
					</p>
				</div>

				<GoogleButton />

				<div className="text-xs mt-8">
					<span className="text-muted-foreground">
						Al registrarse, usted confirma que acepta nuestras
					</span>{' '}
					<Link
						href="/terms"
						className="font-medium text-foreground hover:underline"
					>
						Condiciones de uso
					</Link>{' '}
					<span className="text-muted-foreground">y la </span>{' '}
					<Link
						href="/privacy"
						className="font-medium text-foreground hover:underline"
					>
						Política de privacidad
					</Link>
				</div>
			</div>
		</div>
	);
};

export default AuthPage;
