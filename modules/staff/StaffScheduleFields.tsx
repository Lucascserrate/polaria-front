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
} from '@/modules/staff/utils/schedule';

interface Props {
	draft: ScheduleDraft;
	onChange: (draft: ScheduleDraft) => void;
}

/**
 * Grilla semanal de la jornada propia.
 *
 * Un día sin franjas es un día que no trabaja, igual que en el backend. Admite
 * varias franjas por día para el turno partido del mediodía, que es el caso por
 * el que la tabla acepta más de una fila por día.
 */
const StaffScheduleFields: React.FC<Props> = ({ draft, onChange }) => {
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
				const works = ranges.length > 0;

				return (
					<div key={dayOfWeek} className="p-3">
						<label className="flex items-center gap-3 cursor-pointer">
							<Checkbox
								checked={works}
								onCheckedChange={(next) =>
									setDayRanges(
										dayOfWeek,
										next === true ? [{ ...DEFAULT_RANGE }] : [],
									)
								}
							/>
							<span className="text-sm font-medium w-24">{label}</span>
							{!works && (
								<span className="text-sm text-muted-foreground">No trabaja</span>
							)}
						</label>

						{works && (
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

export default StaffScheduleFields;
