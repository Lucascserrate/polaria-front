import SettingsSectionHeader from '@/modules/settings/SettingsSectionHeader';
import BusinessPhotosSection from '@/modules/settings/sections/BusinessPhotosSection';

export default function BusinessPhotosSettingsPage() {
	return (
		<div className="mx-auto w-full max-w-2xl space-y-8 pb-6">
			<SettingsSectionHeader
				title="Fotos del negocio"
				description="Lo que ve un cliente antes de reservar. Es opcional."
			/>
			<BusinessPhotosSection />
		</div>
	);
}
