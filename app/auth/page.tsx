'use client';

import Link from 'next/link';
import GoogleButton from '@/components/GoogleButton';
import { StarGlyph } from '../logo';

const AuthPage = () => {
	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,#f7fafc_0%,#eef2ff_38%,#ffffff_100%)] flex items-center justify-center p-4">
			<div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white/90 backdrop-blur shadow-[0_24px_80px_rgba(15,23,42,0.12)] p-8">
				<div className="text-center mb-8">
					<div className="flex justify-center items-center gap-2 mb-2">
						<StarGlyph className="w-6 h-6" />
						<h1 className="text-3xl font-semibold text-neutral-900 ">
							Polaria
						</h1>
					</div>
					<p className="text-neutral-600">
						Tu asistente de reserva inteligente.
					</p>
				</div>

				<GoogleButton />

				<div className="text-xs mt-8">
					<span className="text-gray-500">
						Al registrarse, usted confirma que acepta nuestras
					</span>{' '}
					<Link
						href="/terms"
						className="font-medium text-neutral-900 hover:underline"
					>
						Condiciones de uso
					</Link>{' '}
					<span className="text-gray-500">y la </span>{' '}
					<Link
						href="/privacy"
						className="font-medium text-neutral-900 hover:underline"
					>
						Política de privacidad
					</Link>
				</div>
			</div>
		</div>
	);
};

export default AuthPage;
