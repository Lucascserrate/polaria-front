import SettingsForm from '@/modules/settings/SettingsForm';

export default function SettingsPage() {
	return (
		<div className="space-y-6 pb-5">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
				<p className="text-muted-foreground mt-1">
					Configura los ajustes y preferencias de tu barbería
				</p>
			</div>

			{/* Settings Form */}
			<SettingsForm />
		</div>
	);
}
