'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import WeeklyScheduleFields from '@/modules/schedule/WeeklyScheduleFields';
import type { ScheduleDraft } from '@/modules/schedule/utils/weeklySchedule';
import SectionHeader from '../SectionHeader';

interface Props {
	usesCustomSchedule: boolean;
	onUsesCustomScheduleChange: (next: boolean) => void;
	scheduleDraft: ScheduleDraft;
	onScheduleChange: (draft: ScheduleDraft) => void;
	error?: string;
	warnings?: string[];
}

/**
 * La jornada de una persona.
 *
 * La grilla es `WeeklyScheduleFields`, el mismo componente con el que se carga el
 * horario del negocio: las dos jornadas se guardan igual —una fila por franja— y
 * hacer una versión propia para esta pantalla habría sido mantener dos.
 *
 * El interruptor de arriba no es una preferencia de la pantalla: apagado, las
 * franjas guardadas se ignoran y la persona atiende en el horario del local. Ver
 * `Staff.usesCustomSchedule`.
 */
const ScheduleSection: React.FC<Props> = ({
	usesCustomSchedule,
	onUsesCustomScheduleChange,
	scheduleDraft,
	onScheduleChange,
	error,
	warnings = [],
}) => (
	<div className="space-y-6">
		<SectionHeader
			title="Horarios"
			description="Cuándo trabaja. Por defecto, en el horario del negocio."
		/>

		<label className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
			<span>
				<Label className="cursor-pointer">Jornada propia</Label>
				<span className="mt-1 block text-xs text-muted-foreground">
					{usesCustomSchedule
						? 'Solo recibe turnos en los días y horas marcados abajo.'
						: 'Atiende en el horario del negocio. Si el local cambia de horario, esta persona lo sigue.'}
				</span>
			</span>
			<Switch
				checked={usesCustomSchedule}
				onCheckedChange={onUsesCustomScheduleChange}
			/>
		</label>

		{usesCustomSchedule && (
			<div className="space-y-3">
				<WeeklyScheduleFields
					draft={scheduleDraft}
					onChange={onScheduleChange}
					emptyDayLabel="No trabaja"
				/>

				{error && <p className="text-sm text-destructive">{error}</p>}

				{warnings.map((warning) => (
					<p key={warning} className="text-sm text-warning">
						{warning}
					</p>
				))}
			</div>
		)}
	</div>
);

export default ScheduleSection;
