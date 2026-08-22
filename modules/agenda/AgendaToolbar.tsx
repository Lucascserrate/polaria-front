'use client';

import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import MonthCalendar from '@/components/MonthCalendar';
import { cn } from '@/lib/utils';
import { weekDaysOf } from './utils/calendarLayout';

export type AgendaView = 'day' | 'week';

const dayFormatter = new Intl.DateTimeFormat('es', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
});

const dayMonthFormatter = new Intl.DateTimeFormat('es', {
	day: 'numeric',
	month: 'long',
});

const dayOnlyFormatter = new Intl.DateTimeFormat('es', { day: 'numeric' });

const monthYearFormatter = new Intl.DateTimeFormat('es', {
	month: 'long',
	year: 'numeric',
});

/** Medianoche UTC de la fecha: solo se usa para formatear, nunca para comparar. */
const toDate = (key: string): Date => {
	const [year, month, day] = key.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day));
};

const capitalize = (value: string) =>
	value.charAt(0).toUpperCase() + value.slice(1);

/**
 * La fecha o el rango que se está mirando.
 *
 * En la semana se dice el mes una sola vez cuando los siete días caen en el
 * mismo: "17 – 23 de agosto de 2026" se lee mejor que repetir "de agosto" dos
 * veces, y cuando la semana está partida entre dos meses hay que decirlo igual.
 */
export const describePeriod = (view: AgendaView, dateKey: string): string => {
	if (view === 'day') {
		return capitalize(dayFormatter.format(toDate(dateKey)));
	}

	const week = weekDaysOf(dateKey);
	const first = toDate(week[0]);
	const last = toDate(week[6]);

	const sameMonth =
		first.getUTCMonth() === last.getUTCMonth() &&
		first.getUTCFullYear() === last.getUTCFullYear();

	if (sameMonth) {
		return `${dayOnlyFormatter.format(first)} – ${dayOnlyFormatter.format(last)} de ${monthYearFormatter.format(first)}`;
	}

	const sameYear = first.getUTCFullYear() === last.getUTCFullYear();

	return sameYear
		? `${dayMonthFormatter.format(first)} – ${dayMonthFormatter.format(last)} de ${first.getUTCFullYear()}`
		: `${dayMonthFormatter.format(first)} de ${first.getUTCFullYear()} – ${dayMonthFormatter.format(last)} de ${last.getUTCFullYear()}`;
};

const VIEWS: Array<{ value: AgendaView; label: string }> = [
	{ value: 'day', label: 'Día' },
	{ value: 'week', label: 'Semana' },
];

interface Props {
	view: AgendaView;
	onViewChange: (view: AgendaView) => void;
	/** Día abierto, `YYYY-MM-DD`. En la vista semanal, cualquiera de sus siete días. */
	selectedDate: string;
	/** Hoy **en la zona del negocio**. */
	todayKey: string;
	onDateChange: (date: string) => void;
	/** Un día o una semana, según la vista. */
	onShift: (direction: -1 | 1) => void;
	/** Hay una consulta en vuelo. Se dice al lado de la fecha, que es lo que cambió. */
	busy?: boolean;
	/** El botón de crear cita, que vive afuera para no duplicar su flujo. */
	action?: React.ReactNode;
}

/**
 * Barra de navegación de la agenda.
 *
 * Compacta a propósito: lo que tiene que ocupar la pantalla es el calendario.
 * Todo lo que hay acá responde a "qué estoy mirando" —cuándo y con qué forma— y
 * nada más.
 */
const AgendaToolbar: React.FC<Props> = ({
	view,
	onViewChange,
	selectedDate,
	todayKey,
	onDateChange,
	onShift,
	busy = false,
	action,
}) => {
	const [pickerOpen, setPickerOpen] = useState(false);

	return (
		<div className="flex flex-wrap items-center gap-2 border-b border-border bg-background px-3 py-2">
			<div className="flex items-center gap-1">
				<Button
					variant="outline"
					size="sm"
					disabled={selectedDate === todayKey}
					onClick={() => onDateChange(todayKey)}
				>
					Hoy
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label={view === 'week' ? 'Semana anterior' : 'Día anterior'}
					onClick={() => onShift(-1)}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					aria-label={view === 'week' ? 'Semana siguiente' : 'Día siguiente'}
					onClick={() => onShift(1)}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>

			{/* La fecha al centro, y es el acceso al calendario: es lo que se mira
			    primero cuando hay que ir a otra semana lejana. */}
			<Popover open={pickerOpen} onOpenChange={setPickerOpen}>
				<PopoverTrigger asChild>
					<Button variant="ghost" size="sm" className="mx-auto gap-1.5">
						<span className="text-sm font-medium">
							{describePeriod(view, selectedDate)}
						</span>
						{busy ? (
							<Spinner className="size-3.5 text-muted-foreground" />
						) : (
							<ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
						)}
					</Button>
				</PopoverTrigger>
				<PopoverContent align="center" className="w-auto p-3">
					<MonthCalendar
						value={selectedDate}
						today={todayKey}
						onChange={(date) => {
							onDateChange(date);
							setPickerOpen(false);
						}}
					/>
				</PopoverContent>
			</Popover>

			<div className="flex items-center gap-2">
				<div className="flex items-center rounded-lg border border-border p-0.5">
					{VIEWS.map((option) => (
						<button
							key={option.value}
							type="button"
							aria-pressed={view === option.value}
							onClick={() => onViewChange(option.value)}
							className={cn(
								'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
								view === option.value
									? 'bg-muted text-foreground'
									: 'text-muted-foreground hover:text-foreground',
							)}
						>
							{option.label}
						</button>
					))}
				</div>

				{action}
			</div>
		</div>
	);
};

export default AgendaToolbar;
