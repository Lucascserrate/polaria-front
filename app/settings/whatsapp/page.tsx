import SettingsSectionHeader from '@/modules/settings/SettingsSectionHeader';
import WhatsappSettingsSection from '@/modules/settings/sections/WhatsappSettingsSection';
import WhatsappNotificationsCard from '@/modules/settings/WhatsappNotificationsCard';

export default function WhatsappSettingsPage() {
	return (
		<div className="mx-auto w-full max-w-2xl space-y-8 pb-6">
			<SettingsSectionHeader
				title="WhatsApp"
				description="La cuenta por la que tus clientes reservan."
			/>
			<WhatsappSettingsSection />
			<WhatsappNotificationsCard />
		</div>
	);
}
