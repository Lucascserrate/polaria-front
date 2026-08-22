import SettingsIndex from '@/modules/settings/SettingsIndex';

export default function SettingsPage() {
	return (
		<div className="mx-auto w-full max-w-2xl space-y-6 pb-6">
			<div className="space-y-1">
				<h1 className="text-2xl font-semibold tracking-tight">Configuración</h1>
				<p className="text-sm text-muted-foreground">
					Los ajustes de tu negocio, por sección.
				</p>
			</div>

			<SettingsIndex />
		</div>
	);
}
