'use client';

import { useState } from 'react';
import { CalendarDays } from 'lucide-react';
import DateRangeCalendar from '@/components/DateRangeCalendar';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { DateRange } from '@/lib/dateRange';
import type { ReportPreset } from '@/types/reports.types';
import { formatRange } from './utils/format';

const QUICK_PRESETS: Array<{
	preset: ReportPreset;
	label: string;
	/** El mismo atajo con menos letras, para cuando entra en un cuarto de pantalla. */
	short: string;
}> = [
	{ preset: 'today', label: 'Hoy', short: 'Hoy' },
	{ preset: 'week', label: 'Esta semana', short: 'Semana' },
	{ preset: 'month', label: 'Este mes', short: 'Mes' },
];

interface Props {
	preset: ReportPreset;
	range: DateRange;
	onPresetChange: (preset: ReportPreset) => void;
	onRangeChange: (range: DateRange) => void;
	/**
	 * `inline` son los botones sueltos de siempre, que es lo que usa el dashboard
	 * del negocio. `segmented` es un control de cuatro celdas parejas a todo el
	 * ancho, para las estadísticas del profesional, que se miran desde el teléfono.
	 *
	 * Son dos formas y no una porque el ancho disponible es distinto: cuatro botones
	 * con sus etiquetas completas hacen `wrap` a dos filas en una pantalla de 360px,
	 * y dos filas de botones arriba de todo empujan el número importante fuera de la
	 * vista.
	 */
	variant?: 'inline' | 'segmented';
}

/**
 * Qué período se está mirando.
 *
 * Los tres atajos cubren casi todas las consultas; el cuarto control es el rango
 * a medida. En la variante `inline` muestra las fechas elegidas y hace de cartel
 * de "qué estoy viendo"; en la `segmented` es solo el ícono, porque ahí ese cartel
 * ya lo pone el encabezado del titular y las cuatro celdas tienen que medir igual.
 *
 * El rango se arma clickeando dos días en un calendario de dos meses en vez de
 * tipearlos en dos campos. No es solo comodidad: con dos campos libres se podía
 * pedir un "desde" posterior al "hasta", y había que validarlo y explicarlo. Acá
 * ese estado no existe —ver `nextRangeSelection`—, así que tampoco existe el
 * error.
 */
const PeriodSelector: React.FC<Props> = ({
	preset,
	range,
	onPresetChange,
	onRangeChange,
	variant = 'inline',
}) => {
	const [pickerOpen, setPickerOpen] = useState(false);

	const isCustom = preset === 'custom';
	const customLabel =
		isCustom && range.to ? formatRange(range.from, range.to) : 'Personalizado';

	const pickRange = (next: DateRange) => {
		onRangeChange(next);
		// Se cierra recién cuando el rango quedó completo: mientras falte el
		// segundo extremo no hay nada que consultar, y cerrarse en el medio era
		// justamente lo que obligaba a abrir el calendario dos veces para elegir
		// un período.
		if (next.to) setPickerOpen(false);
	};

	/**
	 * El calendario es el mismo en las dos variantes; lo único que cambia es qué lo
	 * abre. Se arma acá y no dos veces para que no puedan divergir.
	 */
	const picker = (trigger: React.ReactNode) => (
		<Popover open={pickerOpen} onOpenChange={setPickerOpen}>
			<PopoverTrigger asChild>{trigger}</PopoverTrigger>

			<PopoverContent align="start" className="w-auto p-3">
				<DateRangeCalendar range={range} onChange={pickRange} />
			</PopoverContent>
		</Popover>
	);

	if (variant === 'segmented') {
		return (
			<div
				role="group"
				aria-label="Período"
				className="grid grid-cols-4 gap-1 rounded-xl border border-border bg-muted/50 p-1 sm:max-w-sm"
			>
				{QUICK_PRESETS.map((option) => (
					<Segment
						key={option.preset}
						active={preset === option.preset}
						onClick={() => onPresetChange(option.preset)}
					>
						{option.short}
					</Segment>
				))}

				{/*
				 * La cuarta celda es solo el ícono. Escribir las fechas elegidas la haría
				 * tres veces más ancha que las otras tres y rompería el control; el rango
				 * a medida se lee igual, en el encabezado del titular, que es donde
				 * siempre dice qué período se está mirando.
				 */}
				{picker(
					<Segment
						active={isCustom}
						onClick={() => onPresetChange('custom')}
						aria-label={
							isCustom && range.to
								? `Período personalizado: ${customLabel}`
								: 'Elegir un período personalizado'
						}
					>
						<CalendarDays className="mx-auto h-4 w-4" />
					</Segment>,
				)}
			</div>
		);
	}

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

			{picker(
				<Button
					type="button"
					size="sm"
					variant={isCustom ? 'default' : 'outline'}
					className="gap-1.5"
					onClick={() => onPresetChange('custom')}
				>
					<CalendarDays className="h-3.5 w-3.5" />
					{customLabel}
				</Button>,
			)}
		</div>
	);
};

interface SegmentProps extends React.ComponentProps<'button'> {
	active: boolean;
}

/**
 * Una celda del control segmentado.
 *
 * No es un `Button`: las variantes de botón dibujan un borde por elemento, y acá
 * el borde es del grupo. La celda activa se distingue por fondo, que es como se
 * lee un control segmentado sin sumar cuatro rectángulos.
 */
const Segment: React.FC<SegmentProps> = ({ active, className, ...props }) => (
	<button
		type="button"
		aria-pressed={active}
		className={cn(
			'rounded-lg px-2 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
			active
				? 'bg-background text-foreground shadow-sm'
				: 'text-muted-foreground hover:text-foreground',
			className,
		)}
		{...props}
	/>
);

export default PeriodSelector;
