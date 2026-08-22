import SettingsSectionHeader from '@/modules/settings/SettingsSectionHeader';
import BusinessHoursSection from '@/modules/settings/sections/BusinessHoursSection';

export default function HoursSettingsPage() {
	return (
		<div className="mx-auto w-full max-w-2xl space-y-8 pb-6">
			<SettingsSectionHeader
				title="Horarios de atención"
				description="Polaria solo agenda dentro de estos horarios."
			/>
			<BusinessHoursSection />
		</div>
	);
}
