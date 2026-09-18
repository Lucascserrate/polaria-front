import GoogleButton from '@/components/GoogleButton';
import { StarGlyph } from '../logo';
import Link from 'next/link';
import { SITES } from '@/constants/site';
import AuthPhotos from '@/modules/auth/AuthPhotos';

const AuthPage = () => {
	return (
		<div className="flex min-h-screen">
			<div className="flex w-full flex-col bg-background bg-[radial-gradient(circle_at_top,oklch(0.55_0.18_264/0.13)_0%,transparent_65%)] px-6 py-12 sm:px-10 lg:w-1/2 lg:px-16">
				<div className="flex flex-1 items-center">
					<div className="mx-auto w-full max-w-sm">
						<div className="mb-2 flex items-center gap-2">
							<StarGlyph className="h-6 w-6" />
							<h1 className="text-3xl font-semibold text-foreground">
								Polaria
							</h1>
						</div>

						<p className="mb-8 text-muted-foreground">
							Tu asistente de reservas.
						</p>

						<GoogleButton />

						<div className="mt-6 text-sm">
							<p className="text-muted-foreground">
								¿Sos cliente y querés reservar una cita?
							</p>
							<a
								href={SITES.marketplace}
								className="mt-1 inline-block font-medium text-foreground hover:underline"
							>
								Ir a Polaria para clientes
							</a>
						</div>
					</div>
				</div>

				<div className="mx-auto mt-12 w-full max-w-sm text-xs">
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

			<AuthPhotos className="hidden lg:block lg:w-1/2" />
		</div>
	);
};

export default AuthPage;
