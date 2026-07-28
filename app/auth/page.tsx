'use client';

import GoogleButton from '@/components/GoogleButton';

const AuthPage = () => {
	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top,#f7fafc_0%,#eef2ff_38%,#ffffff_100%)] flex items-center justify-center p-4">
			<div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white/90 backdrop-blur shadow-[0_24px_80px_rgba(15,23,42,0.12)] p-8">
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-neutral-900 mb-2">Polaria</h1>
					<p className="text-neutral-600">AI booking assistant</p>
				</div>

				<GoogleButton />

				<div className="text-xs mt-8">
					<span className="text-gray-500">
						Al continuar, usted confirma que acepta nuestras
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
