import GoogleButton from '@/components/GoogleButton';

const AuthPage = () => {
	return (
		<div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
						Polaria
					</h1>
					<p className="text-neutral-600 dark:text-neutral-400">
						AI booking assistant
					</p>
				</div>

				<GoogleButton href="/auth/google" />

				{/* Footer */}
				<div className="text-xs mt-8">
					<span className="text-gray-500">
						Al registrarse, usted confirma que acepta nuestras
					</span>{' '}
					<span className="font-medium">Condiciones de uso</span>{' '}
					<span className="text-gray-500">y la </span>{' '}
					<span className="font-medium">Política de privacidad</span>
				</div>
			</div>
		</div>
	);
};

export default AuthPage;
