import SettingsSectionHeader from '@/modules/settings/SettingsSectionHeader';
import WelcomeMessageSection from '@/modules/settings/sections/WelcomeMessageSection';

export default function WelcomeMessageSettingsPage() {
	return (
		<div className="mx-auto w-full max-w-2xl space-y-8 pb-6">
			<SettingsSectionHeader
				title="Mensaje de bienvenida"
				description="Lo primero que lee un cliente cuando te escribe por WhatsApp."
			/>
			<WelcomeMessageSection />
		</div>
	);
}
