import PolariaSetupChecklist from '@/modules/onboarding/PolariaSetupChecklist';

/**
 * Los pasos que faltan para que Polaria pueda operar.
 *
 * Vive dentro del panel —con su barra lateral— porque cada paso manda a una
 * pantalla que ya existe y el usuario tiene que poder volver acá.
 */
export default function SetupPage() {
	return (
		<div className="mx-auto w-full max-w-xl space-y-6">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">
					Empezá con Polaria
				</h1>
				<p className="text-sm text-muted-foreground">
					Estos son los pasos que faltan para que tus clientes puedan reservar.
				</p>
			</div>

			<PolariaSetupChecklist />
		</div>
	);
}
