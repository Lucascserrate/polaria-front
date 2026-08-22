import SettingsSectionHeader from '@/modules/settings/SettingsSectionHeader';
import RemindersSection from '@/modules/settings/sections/RemindersSection';

export default function RemindersSettingsPage() {
	return (
		<div className="mx-auto w-full max-w-2xl space-y-8 pb-6">
			<SettingsSectionHeader
				title="Recordatorios"
				description="El aviso automático que reciben tus clientes antes de la cita."
			/>
			<RemindersSection />
		</div>
	);
}
