'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import WeeklyScheduleFields from '@/modules/schedule/WeeklyScheduleFields';
import {
	DEFAULT_RANGE,
	type ScheduleDraft,
} from '@/modules/schedule/utils/weeklySchedule';
import {
	applyRangeToOpenDays,
	DAY_PILLS,
	isDayOpen,
	openDaysCount,
	toggleDay,
	uniformRange,
} from '../utils/uniformSchedule';

interface Props {
	value: ScheduleDraft;
	onChange: (draft: ScheduleDraft) => void;
	error: string | null;
}

/**
 * Horario de atención, en modo simple con salida al detalle.
 *
 * Casi todos los negocios abren el mismo horario los días que abren, así que la
 * pantalla pide los días y **un** rango. Mostrar catorce campos de hora de
 * entrada —uno por extremo de cada día— para que la mayoría escriba el mismo
 * valor siete veces es trabajo que no le sirve a nadie.
 *
 * Los casos que no entran en ese molde —turno partido, sábado corto— siguen
 * siendo posibles: el desplegable abre el editor por día, que es el mismo
 * componente de Configuración y opera sobre la misma estructura.
 */
const HoursStep: React.FC<Props> = ({ value, onChange, error }) => {
	const shared = uniformRange(value);
	const openDays = openDaysCount(value);

	// Si la jornada no se puede describir con un rango único, el detalle se abre
	// solo: es la única vista que dice la verdad sobre lo que hay cargado.
	const [detailOpen, setDetailOpen] = useState(false);
	const showDetail = detailOpen || (openDays > 0 && !shared);

	const editShared = (patch: { startTime?: string; endTime?: string }) => {
		const base = shared ?? DEFAULT_RANGE;
		onChange(applyRangeToOpenDays(value, { ...base, ...patch }));
	};

	return (
		<div className="space-y-6">
			<div className="space-y-3">
				<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
					Tus días
				</p>
				<div className="flex flex-wrap gap-2">
					{DAY_PILLS.map((day) => {
						const open = isDayOpen(value, day.dayOfWeek);
						return (
							<button
								key={day.dayOfWeek}
								type="button"
								aria-pressed={open}
								aria-label={day.label}
								onClick={() => onChange(toggleDay(value, day.dayOfWeek))}
								className={`h-12 w-12 rounded-xl border text-sm font-semibold transition-colors ${
									open
										? 'border-foreground bg-foreground text-background'
										: 'border-border bg-card text-muted-foreground hover:border-foreground/40'
								}`}
							>
								{day.short}
							</button>
						);
					})}
				</div>
			</div>

			{openDays > 0 && shared && (
				<div className="space-y-3">
					<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Abrís a las · Cerrás a las
					</p>
					<div className="flex items-center gap-3">
						<Input
							type="time"
							aria-label="Hora de apertura"
							className="h-14 flex-1 text-center text-lg tabular-nums"
							value={shared.startTime}
							onChange={(event) =>
								editShared({ startTime: event.target.value })
							}
						/>
						<span className="text-sm text-muted-foreground">a</span>
						<Input
							type="time"
							aria-label="Hora de cierre"
							className="h-14 flex-1 text-center text-lg tabular-nums"
							value={shared.endTime}
							onChange={(event) => editShared({ endTime: event.target.value })}
						/>
					</div>
				</div>
			)}

			{openDays > 0 && (
				<div className="space-y-3">
					{!showDetail && (
						<button
							type="button"
							onClick={() => setDetailOpen(true)}
							className="flex items-center gap-1 text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
						>
							<ChevronDown className="h-4 w-4" />
							¿Días distintos o pausas entremedio? Ajustá cada día acá
						</button>
					)}

					{showDetail && (
						<>
							{!shared && (
								<p className="text-sm text-muted-foreground">
									Tus días tienen horarios distintos, así que se editan uno por
									uno.
								</p>
							)}
							<WeeklyScheduleFields draft={value} onChange={onChange} />
						</>
					)}
				</div>
			)}

			{error && <p className="text-sm text-red-600">{error}</p>}
		</div>
	);
};

export default HoursStep;
