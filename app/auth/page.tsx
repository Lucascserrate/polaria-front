'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GoogleButton from '@/components/GoogleButton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { localLogin } from '@/modules/auth/auth.service';
import { ROUTES } from '@/constants/routes';

const AuthPage = () => {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleLocalLogin = async () => {
		const trimmedEmail = email.trim();
		if (!trimmedEmail) {
			setError('Ingresa un correo electrónico.');
			return;
		}

		try {
			setLoading(true);
			setError(null);
			await localLogin(trimmedEmail);
			router.replace(ROUTES.dashboard);
		} catch (loginError) {
			console.error('Error local login:', loginError);
			setError('No se pudo iniciar sesión. Verifica el correo e intenta de nuevo.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f7fafc_0%,_#eef2ff_38%,_#ffffff_100%)] flex items-center justify-center p-4">
			<div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white/90 backdrop-blur shadow-[0_24px_80px_rgba(15,23,42,0.12)] p-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-neutral-900 mb-2">Polaria</h1>
					<p className="text-neutral-600">AI booking assistant</p>
				</div>

				<GoogleButton />

				<div className="my-6 flex items-center gap-3 text-xs text-neutral-400">
					<div className="h-px flex-1 bg-neutral-200" />
					<span>o</span>
					<div className="h-px flex-1 bg-neutral-200" />
				</div>

				<div className="space-y-3">
					<label className="block text-sm font-medium text-neutral-700">
						Correo electrónico
					</label>
					<Input
						type="email"
						placeholder="usuario@correo.com"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						autoComplete="email"
					/>
					{error && <p className="text-sm text-red-600">{error}</p>}
					<Button
						type="button"
						className="w-full"
						onClick={handleLocalLogin}
						disabled={loading}
					>
						{loading ? 'Ingresando...' : 'Entrar'}
					</Button>
				</div>

				<div className="text-xs mt-8">
					<span className="text-gray-500">
						Al registrarse, usted confirma que acepta nuestras
					</span>{' '}
					<span className="font-medium">Condiciones de uso</span>{' '}
					<span className="text-gray-500">y la </span>{' '}
					<span className="font-medium">Política de privacidad</span>
				</div>
			</div>
		</div>
	);
};

export default AuthPage;
