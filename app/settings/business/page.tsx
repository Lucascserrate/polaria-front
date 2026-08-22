import SettingsSectionHeader from '@/modules/settings/SettingsSectionHeader';
import BusinessInfoSection from '@/modules/settings/sections/BusinessInfoSection';

export default function BusinessSettingsPage() {
	return (
		<div className="mx-auto w-full max-w-2xl space-y-8 pb-6">
			<SettingsSectionHeader
				title="Información del negocio"
				description="Cómo se llama, a qué se dedica y dónde queda."
			/>
			<BusinessInfoSection />
		</div>
	);
}
