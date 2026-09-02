'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseDateKey, todayKey } from '@/lib/date';
import {
	buildMonthGrid,
	shiftMonth,
	WEEKDAY_LABELS,
	type MonthGrid,
} from '@/lib/monthGrid';
import {
	isBetweenRange,
	nextRangeSelection,
	type DateRange,
} from '@/lib/dateRange';
import { cn } from '@/lib/utils';

const monthFormatter = new Intl.DateTimeFormat('es', {
	month: 'long',
	year: 'numeric',
});

const dayLabelFormatter = new Intl.DateTimeFormat('es', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
});

const rangeLabelFormatter = new Intl.DateTimeFormat('es', {
	day: 'numeric',
	month: 'short',
});

interface Props {
	range: DateRange;
	/**
	 * El rango que queda después del click. Se avisa completo y no el día suelto:
	 * la regla de qué extremo es cuál vive en `nextRangeSelection`, y hacer que
	 * cada pantalla la aplique por su cuenta es garantizar que alguna la aplique
	 * distinto.
	 */
	onChange: (range: DateRange) => void;
	/**
	 * Hoy, `YYYY-MM-DD`. Lo decide quien lo usa porque el negocio tiene su propia
	 * zona horaria: con la fecha del navegador, a la noche en Bolivia se
	 * resaltaría el día de mañana.
	 */
	today?: string;
}

/**
 * Calendario de dos meses para elegir un período.
 *
 * Existe porque con un solo mes elegir "del 20 de agosto al 5 de septiembre"
 * obligaba a cambiar de mes en el medio de la selección, a ciegas: el primer
 * extremo quedaba en un mes que ya no se veía. Dos meses a la vez es el
 * comportamiento estándar de cualquier selector de rango y resuelve el caso
 * frecuente sin navegar nada.
 *
 * Los dos meses se mueven juntos con un solo par de flechas. Poder correr uno
 * sin el otro deja armar vistas absurdas —agosto junto a marzo— y no resuelve
 * ningún caso real.
 *
 * En pantallas angostas se ve un mes solo. No es una versión degradada: dos
 * meses no entran en 360px sin achicar los días a un tamaño que el dedo no
 * puede acertar.
 */
const DateRangeCalendar: React.FC<Props> = ({
	range,
	onChange,
	today = todayKey(),
}) => {
	/*
	 * El mes de la izquierda es estado propio y no se deriva del rango: se hojean
	 * meses antes de haber elegido nada, y volver solo al mes del rango en cada
	 * render haría imposible navegar.
	 *
	 * Arranca con el inicio del rango a la izquierda, así que un período que cruza
	 * dos meses seguidos se ve entero sin tocar las flechas.
	 */
	const [leftMonth, setLeftMonth] = useState(() => {
		const from = parseDateKey(range.from);
		return new Date(from.getFullYear(), from.getMonth(), 1);
	});

	/**
	 * El día señalado mientras falta el segundo extremo.
	 *
	 * Es lo que convierte la elección en algo que se ve antes de confirmar: sin
	 * esto, entre el primer y el segundo click no hay ninguna señal de qué rango
	 * se está por armar. Se ignora con el rango completo, donde el próximo click
	 * empieza uno nuevo y no hay nada que previsualizar.
	 */
	const [hovered, setHovered] = useState<string | null>(null);

	const preview = useMemo<DateRange>(
		() =>
			range.to === null && hovered !== null
				? nextRangeSelection(range, hovered)
				: range,
		[range, hovered],
	);

	const months = [leftMonth, shiftMonth(leftMonth, 1)];

	const pick = (day: string) => {
		setHovered(null);
		onChange(nextRangeSelection(range, day));
	};

	return (
		<div
			className="select-none"
			onMouseLeave={() => setHovered(null)}
			role="group"
			aria-label="Elegir un período"
		>
			<div className="mb-3 flex items-center justify-between gap-2">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="h-7 w-7 shrink-0 p-0"
					aria-label="Meses anteriores"
					onClick={() => setLeftMonth((current) => shiftMonth(current, -1))}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				{/*
				 * Los títulos van en el mismo renglón que las flechas y no arriba de
				 * cada mes: son dos meses de un solo control, y un encabezado propio
				 * por mes los lee como dos calendarios pegados.
				 */}
				<div className="flex flex-1 justify-around gap-4">
					{months.map((month, index) => (
						<span
							key={month.getTime()}
							className={cn(
								'text-sm font-medium capitalize',
								index === 1 && 'hidden sm:inline',
							)}
						>
							{monthFormatter.format(month)}
						</span>
					))}
				</div>

				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="h-7 w-7 shrink-0 p-0"
					aria-label="Meses siguientes"
					onClick={() => setLeftMonth((current) => shiftMonth(current, 1))}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>

			<div className="flex gap-6">
				{months.map((month, index) => (
					<MonthPanel
						key={month.getTime()}
						month={month}
						preview={preview}
						today={today}
						onPick={pick}
						onHover={setHovered}
						className={index === 1 ? 'hidden sm:block' : undefined}
					/>
				))}
			</div>

			<p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
				{range.to === null
					? 'Elegí el día en que termina el período.'
					: `Del ${formatDay(range.from)} al ${formatDay(range.to)}. Tocá un día para empezar otro período.`}
			</p>
		</div>
	);
};

interface MonthPanelProps {
	month: Date;
	/** El rango a pintar: el elegido, o el que se armaría con el día señalado. */
	preview: DateRange;
	today: string;
	onPick: (day: string) => void;
	onHover: (day: string | null) => void;
	className?: string;
}

/**
 * Un mes de la grilla.
 *
 * El ancho es fijo —siete columnas de 36px— porque el rango se pinta como una
 * barra continua, y para eso las celdas tienen que medir todas igual y pegarse
 * entre sí. Con columnas elásticas y separación horizontal, la barra sale
 * cortada en rayitas.
 */
const MonthPanel: React.FC<MonthPanelProps> = ({
	month,
	preview,
	today,
	onPick,
	onHover,
	className,
}) => {
	const year = month.getFullYear();
	const monthIndex = month.getMonth();
	const grid: MonthGrid = buildMonthGrid(year, monthIndex);

	return (
		<div className={cn('w-[252px] shrink-0', className)}>
			<div className="grid grid-cols-7">
				{WEEKDAY_LABELS.map((label) => (
					<span
						key={label}
						className="pb-1 text-center text-[11px] text-muted-foreground"
						aria-hidden="true"
					>
						{label}
					</span>
				))}
			</div>

			<div className="grid grid-cols-7 gap-y-1">
				{Array.from({ length: grid.leadingBlanks }, (_, index) => (
					<span key={`blank-${index}`} />
				))}

				{grid.days.map((key, index) => {
					const isStart = key === preview.from;
					const isEnd = key === preview.to;
					const isBetween = isBetweenRange(key, preview.from, preview.to);
					const isEdge = isStart || isEnd;

					return (
						/*
						 * Dos capas por celda: la de abajo pinta la barra del rango y llega
						 * hasta el borde de la celda; la de arriba es el día, que sigue
						 * siendo un círculo. Es lo que hace que el período se lea como un
						 * tramo continuo y no como una fila de pastillas sueltas.
						 *
						 * Los extremos redondean su punta, y un rango de un solo día
						 * redondea las dos: queda un círculo, que es lo correcto.
						 */
						<div
							key={key}
							className={cn(
								'flex justify-center',
								(isEdge || isBetween) && 'bg-accent',
								isStart && 'rounded-l-full',
								isEnd && 'rounded-r-full',
							)}
						>
							<button
								type="button"
								onClick={() => onPick(key)}
								onMouseEnter={() => onHover(key)}
								onFocus={() => onHover(key)}
								aria-label={dayLabelFormatter.format(
									new Date(year, monthIndex, index + 1),
								)}
								aria-pressed={isEdge}
								aria-current={key === today ? 'date' : undefined}
								className={cn(
									'flex h-9 w-9 items-center justify-center rounded-full text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
									isEdge
										? 'bg-primary font-semibold text-primary-foreground'
										: isBetween
											? 'hover:bg-accent-foreground/10'
											: key === today
												? 'font-semibold text-primary hover:bg-accent'
												: 'hover:bg-accent',
								)}
							>
								{index + 1}
							</button>
						</div>
					);
				})}
			</div>
		</div>
	);
};

/** `20 ago`, para nombrar los extremos en el pie sin ocupar dos renglones. */
const formatDay = (key: string): string =>
	rangeLabelFormatter.format(parseDateKey(key));

export default DateRangeCalendar;
