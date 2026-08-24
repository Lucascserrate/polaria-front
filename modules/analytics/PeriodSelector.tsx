'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import MonthCalendar from '@/components/MonthCalendar';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { nextRangeSelection, type DateRange } from '@/lib/dateRange';
import type { ReportPreset } from '@/types/reports.types';
import { formatRange } from './utils/format';

const QUICK_PRESETS: Array<{ preset: ReportPreset; label: string }> = [
	{ preset: 'today', label: 'Hoy' },
	{ preset: 'week', label: 'Esta semana' },
	{ preset: 'month', label: 'Este mes' },
];

interface Props {
	preset: ReportPreset;
	range: DateRange;
	onPresetChange: (preset: ReportPreset) => void;
	onRangeChange: (range: DateRange) => void;
}

/**
 * Qué período se está mirando.
 *
 * Los tres atajos cubren casi todas las consultas; el cuarto botón es el rango a
 * medida y muestra las fechas elegidas, así que no hace falta un cartel aparte
 * que diga qué se está viendo.
 *
 * El rango se arma clickeando dos días en un calendario en vez de tipearlos en
 * dos campos. No es solo comodidad: con dos campos libres se podía pedir un
 * "desde" posterior al "hasta", y había que validarlo y explicarlo. Acá ese
 * estado no existe —ver `nextRangeSelection`—, así que tampoco existe el error.
 */
const PeriodSelector: React.FC<Props> = ({
	preset,
	range,
	onPresetChange,
	onRangeChange,
}) => {
	const [pickerOpen, setPickerOpen] = useState(false);

	const isCustom = preset === 'custom';
	const customLabel =
		isCustom && range.to ? formatRange(range.from, range.to) : 'Personalizado';

	const pickDay = (day: string) => {
		const next = nextRangeSelection(range, day);
		onRangeChange(next);
		// Se cierra recién cuando el rango quedó completo: mientras falte el
		// segundo extremo no hay nada que consultar.
		if (next.to) setPickerOpen(false);
	};

	return (
		<div className="flex flex-wrap items-center gap-2">
			{QUICK_PRESETS.map((option) => (
				<Button
					key={option.preset}
					type="button"
					size="sm"
					variant={preset === option.preset ? 'default' : 'outline'}
					onClick={() => onPresetChange(option.preset)}
				>
					{option.label}
				</Button>
			))}

			<Popover open={pickerOpen} onOpenChange={setPickerOpen}>
				<PopoverTrigger asChild>
					<Button
						type="button"
						size="sm"
						variant={isCustom ? 'default' : 'outline'}
						className="gap-1.5"
						onClick={() => onPresetChange('custom')}
					>
						<CalendarDays className="h-3.5 w-3.5" />
						{customLabel}
					</Button>
				</PopoverTrigger>

				<PopoverContent align="start" className="w-auto p-3">
					<p className="mb-2 text-xs text-muted-foreground">
						{range.to
							? 'Elegí un día para empezar otro rango'
							: 'Elegí el día en que termina el período'}
					</p>
					<MonthCalendar
						value={range.from}
						rangeEnd={range.to}
						onChange={pickDay}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export default PeriodSelector;
