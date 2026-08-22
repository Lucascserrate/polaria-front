'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RemindersCard from '@/modules/settings/RemindersCard';
import { DEFAULT_REMINDER_LEAD_MINUTES } from '@/modules/settings/utils/reminders';
import useGetSettings from '@/services/settings/useGetSettings';
import useUpdateSettings from '@/services/settings/useUpdateSettings';

/**
 * Recordatorios automáticos.
 *
 * Envuelve la tarjeta que ya existía, sin tocarla: el rediseño a dos
 * interruptores independientes cambia el modelo del backend y va en su propio
 * paso. Acá solo se le dio pantalla propia.
 */
const RemindersSection: React.FC = () => {
	const { data: settings, isLoading } = useGetSettings();
	const {
		mutateAsync: save,
		isPending,
		isSuccess,
		isError,
	} = useUpdateSettings();

	const [enabled, setEnabled] = useState<boolean | null>(null);
	const [leadMinutes, setLeadMinutes] = useState<number | null>(null);

	const currentEnabled = enabled ?? settings?.reminders.enabled ?? true;
	const currentLead =
		leadMinutes ??
		settings?.reminders.leadMinutes ??
		DEFAULT_REMINDER_LEAD_MINUTES;

	if (isLoading) {
		return <p className="text-sm text-muted-foreground">Cargando...</p>;
	}

	return (
		<div className="space-y-6">
			<RemindersCard
				enabled={currentEnabled}
				leadMinutes={currentLead}
				disabled={isPending}
				whatsappConnected={settings?.whatsappConnection.connected ?? false}
				templateStatus={settings?.whatsappConnection.reminderTemplateStatus}
				onEnabledChange={setEnabled}
				onLeadMinutesChange={setLeadMinutes}
			/>

			{isError && (
				<p className="text-sm text-red-600">
					No se pudo guardar. Intentá de nuevo.
				</p>
			)}

			<Button
				size="lg"
				disabled={isPending}
				onClick={() =>
					void save({
						remindersEnabled: currentEnabled,
						reminderLeadMinutes: currentLead,
					})
				}
			>
				{isPending ? (
					'Guardando...'
				) : isSuccess ? (
					<>
						<Check className="mr-2 h-4 w-4" />
						Guardado
					</>
				) : (
					'Guardar recordatorios'
				)}
			</Button>
		</div>
	);
};

export default RemindersSection;
