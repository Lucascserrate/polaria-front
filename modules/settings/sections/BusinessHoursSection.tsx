'use client';

import { useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WeeklyScheduleFields from '@/modules/schedule/WeeklyScheduleFields';
import {
	fromScheduleDraft,
	toScheduleDraft,
	validateScheduleDraft,
	type ScheduleDraft,
} from '@/modules/schedule/utils/weeklySchedule';
import { DEFAULT_BUSINESS_HOURS } from '@/modules/settings/utils/constants';
import useGetSettings from '@/services/settings/useGetSettings';
import useUpdateSettings from '@/services/settings/useUpdateSettings';

/**
 * Horario semanal de atención.
 *
 * Sigue usando `WeeklyScheduleFields`, el mismo editor que la jornada propia de
 * un profesional. Los feriados y los días especiales son excepciones por fecha:
 * no existen en el modelo todavía y no se insinúan acá.
 */
const BusinessHoursSection: React.FC = () => {
	const { data: settings, isLoading } = useGetSettings();
	const {
		mutateAsync: save,
		isPending,
		isSuccess,
		isError,
	} = useUpdateSettings();

	const [draft, setDraft] = useState<ScheduleDraft | null>(null);

	const saved = useMemo(
		() =>
			toScheduleDraft(
				settings?.businessHours?.length
					? settings.businessHours
					: DEFAULT_BUSINESS_HOURS,
			),
		[settings?.businessHours],
	);

	const schedule = draft ?? saved;
	const error = validateScheduleDraft(
		schedule,
		'Marcá al menos un día de atención: sin horarios el negocio no puede recibir reservas.',
	);

	if (isLoading) {
		return <p className="text-sm text-muted-foreground">Cargando...</p>;
	}

	return (
		<div className="space-y-6">
			<WeeklyScheduleFields draft={schedule} onChange={setDraft} />

			{error && <p className="text-sm text-destructive">{error}</p>}

			{isError && (
				<p className="text-sm text-destructive">
					No se pudo guardar. Intentá de nuevo.
				</p>
			)}

			<Button
				size="lg"
				disabled={Boolean(error) || isPending}
				onClick={() =>
					void save({ businessHours: fromScheduleDraft(schedule) })
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
					'Guardar horarios'
				)}
			</Button>
		</div>
	);
};

export default BusinessHoursSection;
