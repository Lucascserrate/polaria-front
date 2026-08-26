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
import {
	describeDay,
	describeDayShort,
	describeWeek,
	describeWeekShort,
} from './utils/calendarLabels';
import { weekDaysOf } from './utils/calendarLayout';

export type AgendaView = 'day' | 'week';

/**
 * La fecha o el rango que se está mirando.
 *
 * El formateo vive en `calendarLabels`, en UTC: una fecha del calendario no
 * tiene huso, y leerla en el del navegador corre el nombre del día.
 */
export const describePeriod = (view: AgendaView, dateKey: string): string =>
	view === 'day' ? describeDay(dateKey) : describeWeek(weekDaysOf(dateKey));

/** Lo mismo, abreviado, para cuando la barra tiene que entrar en una fila. */
export const describePeriodShort = (
	view: AgendaView,
	dateKey: string,
): string =>
	view === 'day'
		? describeDayShort(dateKey)
		: describeWeekShort(weekDaysOf(dateKey));

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
	/**
	 * El botón de crear cita, que vive afuera para no duplicar su flujo.
	 *
	 * Solo en escritorio: en móvil la misma acción es el botón flotante, que no
	 * le come ancho a la barra.
	 */
	action?: React.ReactNode;
	/**
	 * El botón del menú, solo en móvil.
	 *
	 * Entra acá en lugar de flotar arriba porque flotando obligaba a reservarle
	 * una franja entera de alto a la pantalla, y lo que tiene que ocupar el alto
	 * es el calendario.
	 */
	menu?: React.ReactNode;
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
	menu,
}) => {
	const [pickerOpen, setPickerOpen] = useState(false);

	return (
		<div className="flex flex-wrap items-center gap-2 border-b border-border bg-background px-3 py-2">
			{/*
			 * "Hoy" y las flechas se caen en móvil: son atajos de algo que el
			 * calendario del selector ya hace, y ahí el ancho lo necesita la fecha.
			 */}
			<div className="hidden items-center gap-1 md:flex">
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
					<Button
						variant="ghost"
						size="sm"
						className="mr-auto gap-1.5 md:mx-auto"
					>
						<span className="text-sm font-medium md:hidden">
							{describePeriodShort(view, selectedDate)}
						</span>
						<span className="hidden text-sm font-medium md:inline">
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

				<div className="hidden md:contents">{action}</div>

				<div className="md:hidden">{menu}</div>
			</div>
		</div>
	);
};

export default AgendaToolbar;
