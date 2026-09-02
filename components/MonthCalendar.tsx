'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseDateKey, todayKey } from '@/lib/date';
import { buildMonthGrid, shiftMonth, WEEKDAY_LABELS } from '@/lib/monthGrid';

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
	/**
	 * Hoy, `YYYY-MM-DD`. Lo decide quien lo usa porque la agenda lo resuelve en la
	 * zona del negocio: con la fecha del navegador, a la noche en Bolivia el
	 * calendario resaltaría el día de mañana.
	 */
	today?: string;
}

/**
 * Calendario mensual para elegir **un** día: qué fecha de la agenda se mira.
 *
 * Para elegir un período está `DateRangeCalendar`, que muestra dos meses. Este
 * supo tener un modo rango y lo perdió a propósito: un solo mes obligaba a
 * cambiar de mes en el medio de la selección, con el primer extremo ya fuera de
 * la vista.
 *
 * El mes visible es estado propio y no se deriva de `value`: quien busca una
 * cita hojea meses sin haber elegido todavía, y hacer que la vista salte de
 * vuelta al mes seleccionado en cada render haría imposible navegar.
 */
const MonthCalendar: React.FC<Props> = ({
	value,
	onChange,
	today = todayKey(),
}) => {
	const [visibleMonth, setVisibleMonth] = useState(() => {
		const selected = parseDateKey(value);
		return new Date(selected.getFullYear(), selected.getMonth(), 1);
	});

	const year = visibleMonth.getFullYear();
	const month = visibleMonth.getMonth();
	const grid = buildMonthGrid(year, month);

	const goToMonth = (delta: number) =>
		setVisibleMonth((current) => shiftMonth(current, delta));

	const goToToday = () => {
		// El mes sale de `today` y no del reloj del navegador: son la misma fecha
		// salvo en el borde del mes, que es justo donde importa.
		const parsed = parseDateKey(today);
		setVisibleMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
		onChange(today);
	};

	return (
		<div className="w-60">
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
						onClick={() => goToMonth(-1)}
					>
						<ChevronLeft className="w-4 h-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-7 w-7 p-0"
						aria-label="Mes siguiente"
						onClick={() => goToMonth(1)}
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

				{Array.from({ length: grid.leadingBlanks }, (_, index) => (
					<span key={`blank-${index}`} />
				))}

				{grid.days.map((key, index) => {
					const date = new Date(year, month, index + 1);
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
