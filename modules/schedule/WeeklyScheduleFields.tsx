'use client';

import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
	DEFAULT_RANGE,
	WEEK_DAYS,
	type DayRange,
	type ScheduleDraft,
} from '@/modules/schedule/utils/weeklySchedule';

interface Props {
	draft: ScheduleDraft;
	onChange: (draft: ScheduleDraft) => void;
	/** Qué se muestra en un día sin franjas: el negocio cierra, la persona no trabaja. */
	emptyDayLabel?: string;
}

/**
 * Grilla semanal de horarios, para el negocio y para la jornada propia de un
 * profesional.
 *
 * Un día sin franjas es un día sin atención, igual que en el backend. Admite
 * varias franjas por día para el turno partido del mediodía, que es el caso por
 * el que las tablas aceptan más de una fila por día.
 */
const WeeklyScheduleFields: React.FC<Props> = ({
	draft,
	onChange,
	emptyDayLabel = 'Cerrado',
}) => {
	const setDayRanges = (dayOfWeek: number, ranges: DayRange[]) =>
		onChange({ ...draft, [dayOfWeek]: ranges });

	const updateRange = (
		dayOfWeek: number,
		ranges: DayRange[],
		index: number,
		patch: Partial<DayRange>,
	) =>
		setDayRanges(
			dayOfWeek,
			ranges.map((range, position) =>
				position === index ? { ...range, ...patch } : range,
			),
		);

	return (
		<div className="border border-border rounded-lg divide-y divide-border">
			{WEEK_DAYS.map(({ dayOfWeek, label }) => {
				const ranges = draft[dayOfWeek] ?? [];
				const isOpen = ranges.length > 0;

				return (
					<div key={dayOfWeek} className="p-3">
						<label className="flex items-center gap-3 cursor-pointer">
							<Checkbox
								checked={isOpen}
								onCheckedChange={(next) =>
									setDayRanges(
										dayOfWeek,
										next === true ? [{ ...DEFAULT_RANGE }] : [],
									)
								}
							/>
							<span className="text-sm font-medium w-24">{label}</span>
							{!isOpen && (
								<span className="text-sm text-muted-foreground">
									{emptyDayLabel}
								</span>
							)}
						</label>

						{isOpen && (
							<div className="pl-8 mt-2 space-y-2">
								{ranges.map((range, index) => (
									<div key={index} className="flex items-center gap-2">
										<Input
											type="time"
											className="w-32"
											value={range.startTime}
											aria-label={`Inicio de la franja ${index + 1} del ${label.toLowerCase()}`}
											onChange={(e) =>
												updateRange(dayOfWeek, ranges, index, {
													startTime: e.target.value,
												})
											}
										/>
										<span className="text-sm text-muted-foreground">a</span>
										<Input
											type="time"
											className="w-32"
											value={range.endTime}
											aria-label={`Fin de la franja ${index + 1} del ${label.toLowerCase()}`}
											onChange={(e) =>
												updateRange(dayOfWeek, ranges, index, {
													endTime: e.target.value,
												})
											}
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											aria-label={`Quitar franja del ${label.toLowerCase()}`}
											onClick={() =>
												setDayRanges(
													dayOfWeek,
													ranges.filter((_, position) => position !== index),
												)
											}
										>
											<X className="w-4 h-4" />
										</Button>
									</div>
								))}

								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-8 px-2 text-xs"
									onClick={() =>
										setDayRanges(dayOfWeek, [...ranges, { ...DEFAULT_RANGE }])
									}
								>
									<Plus className="w-3 h-3 mr-1" />
									Agregar franja
								</Button>
							</div>
						)}
					</div>
				);
			})}
		</div>
	);
};

export default WeeklyScheduleFields;
