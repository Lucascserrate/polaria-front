'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import RemindersCard from '@/modules/settings/RemindersCard';
import useGetSettings from '@/services/settings/useGetSettings';
import useUpdateSettings from '@/services/settings/useUpdateSettings';

/**
 * Recordatorios automáticos.
 *
 * Las anticipaciones van y vienen tal cual, sin traducirse a un valor único: la
 * pantalla ofrece las mismas opciones independientes que el backend guarda.
 */
const RemindersSection: React.FC = () => {
	const { data: settings, isLoading } = useGetSettings();
	const {
		mutateAsync: save,
		isPending,
		isSuccess,
		isError,
	} = useUpdateSettings();

	// `null` hasta que se toque algo: hasta entonces manda lo guardado.
	const [offsets, setOffsets] = useState<number[] | null>(null);

	if (isLoading) {
		return <p className="text-sm text-muted-foreground">Cargando...</p>;
	}

	const currentOffsets = offsets ?? settings?.reminders.offsets ?? [];

	return (
		<div className="space-y-6">
			<RemindersCard
				offsets={currentOffsets}
				onChange={setOffsets}
				previewText={settings?.reminders.previewText ?? ''}
				previewButtons={settings?.reminders.previewButtons ?? []}
				disabled={isPending}
				whatsappConnected={settings?.whatsappConnection.connected ?? false}
				templateStatus={settings?.whatsappConnection.reminderTemplateStatus}
			/>

			{isError && (
				<p className="text-sm text-red-600">
					No se pudo guardar. Intentá de nuevo.
				</p>
			)}

			<Button
				size="lg"
				disabled={isPending}
				onClick={() => void save({ reminderOffsets: currentOffsets })}
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
