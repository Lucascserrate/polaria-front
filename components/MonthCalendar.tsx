'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseDateKey, toDateKey, todayKey } from '@/lib/date';

/**
 * La semana arranca el lunes, igual que la grilla de horarios de Configuración.
 * `Date.getDay()` cuenta desde el domingo, así que hay que correr el índice.
 */
const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const monthFormatter = new Intl.DateTimeFormat('es', {
	month: 'long',
	year: 'numeric',
});

const dayLabelFormatter = new Intl.DateTimeFormat('es', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
});

interface Props {
	/** Día seleccionado, `YYYY-MM-DD`. */
	value: string;
	onChange: (date: string) => void;
}

/**
 * Calendario mensual para elegir qué día de la agenda se está mirando.
 *
 * El mes visible es estado propio y no se deriva de `value`: quien busca una
 * cita hojea meses sin haber elegido todavía, y hacer que la vista salte de
 * vuelta al mes seleccionado en cada render haría imposible navegar.
 */
const MonthCalendar: React.FC<Props> = ({ value, onChange }) => {
	const [visibleMonth, setVisibleMonth] = useState(() => {
		const selected = parseDateKey(value);
		return new Date(selected.getFullYear(), selected.getMonth(), 1);
	});

	const today = todayKey();
	const year = visibleMonth.getFullYear();
	const month = visibleMonth.getMonth();

	// Cuántas celdas vacías van antes del día 1 para que caiga en su columna.
	const leadingBlanks = (new Date(year, month, 1).getDay() + 6) % 7;
	// El día 0 del mes siguiente es el último de este.
	const daysInMonth = new Date(year, month + 1, 0).getDate();

	const shiftMonth = (delta: number) =>
		setVisibleMonth(new Date(year, month + delta, 1));

	const goToToday = () => {
		const now = new Date();
		setVisibleMonth(new Date(now.getFullYear(), now.getMonth(), 1));
		onChange(today);
	};

	return (
		<div className="bg-card border border-border rounded-lg p-4">
			<div className="flex items-center justify-between mb-3">
				<span className="text-sm font-medium capitalize">
					{monthFormatter.format(visibleMonth)}
				</span>
				<div className="flex items-center gap-1">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-7 w-7 p-0"
						aria-label="Mes anterior"
						onClick={() => shiftMonth(-1)}
					>
						<ChevronLeft className="w-4 h-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-7 w-7 p-0"
						aria-label="Mes siguiente"
						onClick={() => shiftMonth(1)}
					>
						<ChevronRight className="w-4 h-4" />
					</Button>
				</div>
			</div>

			<div className="grid grid-cols-7 gap-y-1 justify-items-center">
				{WEEKDAY_LABELS.map((label) => (
					<span
						key={label}
						className="text-[11px] text-muted-foreground pb-1"
						aria-hidden="true"
					>
						{label}
					</span>
				))}

				{Array.from({ length: leadingBlanks }, (_, index) => (
					<span key={`blank-${index}`} />
				))}

				{Array.from({ length: daysInMonth }, (_, index) => {
					const date = new Date(year, month, index + 1);
					const key = toDateKey(date);
					const isSelected = key === value;
					const isToday = key === today;

					return (
						<button
							key={key}
							type="button"
							onClick={() => onChange(key)}
							aria-label={dayLabelFormatter.format(date)}
							aria-pressed={isSelected}
							aria-current={isToday ? 'date' : undefined}
							className={`h-8 w-8 rounded-full text-sm flex items-center justify-center transition-colors ${
								isSelected
									? 'bg-primary text-primary-foreground font-semibold'
									: isToday
										? 'text-primary font-semibold hover:bg-accent'
										: 'hover:bg-accent'
							}`}
						>
							{index + 1}
						</button>
					);
				})}
			</div>

			{value !== today && (
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="w-full mt-2 h-8 text-xs"
					onClick={goToToday}
				>
					Volver a hoy
				</Button>
			)}
		</div>
	);
};

export default MonthCalendar;
