'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import MonthCalendar from '@/components/MonthCalendar';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { BookingSlotItem } from '@/services/availability/useGetSlotsForBooking';
import { describeDayShort } from './utils/calendarLabels';
import { formatMinute, minutesInTimeZone } from './utils/calendarLayout';
import useBookingTimeOptions from './useBookingTimeOptions';

interface Props {
	/** Día que se está mirando, `YYYY-MM-DD`. */
	dayKey: string;
	onDayChange: (day: string) => void;
	/** Inicio elegido, en ISO. `null` mientras no haya ninguno. */
	startTime: string | null;
	onStartTimeChange: (startTime: string) => void;
	/** Hoy en la zona del negocio. */
	todayKey: string;
	timezone?: string;
	items: BookingSlotItem[];
	totalMinutes: number;
	disabled?: boolean;
}

/**
 * Cuándo es la reserva, editable donde se lee.
 *
 * El día y la hora se cambian tocándolos, no entrando a otro paso. Antes eran
 * una fila que llevaba a una pantalla aparte, y eso los ponía **antes** que el
 * servicio en el orden mental: parecía que había que decidir la fecha primero,
 * cuando en realidad no se puede: hasta que no hay un servicio no se sabe cuánto
 * dura la reserva, y sin eso no hay horarios que ofrecer.
 *
 * Por eso acá el día abre un calendario y la hora abre la lista de horarios, los
 * dos sobre la misma pantalla. El paso completo sigue existiendo para la
 * edición, donde hay lugar de sobra y la reserva ya está armada.
 */
const BookingWhenField: React.FC<Props> = ({
	dayKey,
	onDayChange,
	startTime,
	onStartTimeChange,
	todayKey,
	timezone,
	items,
	totalMinutes,
	disabled = false,
}) => {
	const [dayOpen, setDayOpen] = useState(false);
	const [timeOpen, setTimeOpen] = useState(false);

	const minute = startTime ? minutesInTimeZone(startTime, timezone) : null;

	return (
		<div className="space-y-1">
			<Popover open={dayOpen} onOpenChange={setDayOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
						disabled={disabled}
						className="-mx-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-2xl font-semibold tracking-tight transition-colors hover:bg-muted/60 disabled:pointer-events-none disabled:opacity-60"
					>
						{describeDayShort(dayKey)}
						<ChevronDown className="size-5 text-muted-foreground" />
					</button>
				</PopoverTrigger>

				<PopoverContent align="start" className="w-auto p-3">
					<MonthCalendar
						value={dayKey}
						today={todayKey}
						onChange={(next) => {
							onDayChange(next);
							setDayOpen(false);
							/*
							 * Se abre la hora enseguida: cambiar de día invalida la que
							 * estaba elegida —los horarios libres son otros— así que el
							 * paso siguiente es siempre el mismo, y hacerlo solo evita un
							 * click que no decide nada.
							 */
							setTimeOpen(true);
						}}
					/>
				</PopoverContent>
			</Popover>

			<Popover open={timeOpen} onOpenChange={setTimeOpen}>
				<PopoverTrigger asChild>
					<button
						type="button"
						disabled={disabled}
						className="-mx-2 flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm text-muted-foreground transition-colors hover:bg-muted/60 disabled:pointer-events-none disabled:opacity-60"
					>
						<span
							className={cn(
								'tabular-nums',
								minute === null
									? 'text-amber-600'
									: 'font-medium text-foreground',
							)}
						>
							{minute === null ? 'Elegir hora' : formatMinute(minute)}
						</span>
						<ChevronDown className="size-4" />
						{totalMinutes > 0 && <span>· {totalMinutes} min en total</span>}
					</button>
				</PopoverTrigger>

				<PopoverContent align="start" className="w-56 p-0">
					{/*
					 * El contenido se monta al abrir —Radix lo desmonta al cerrar— así
					 * que la consulta de disponibilidad sale una sola vez, cuando alguien
					 * realmente va a elegir una hora, y no en cada render del panel.
					 */}
					<TimeList
						dayKey={dayKey}
						todayKey={todayKey}
						timezone={timezone}
						items={items}
						totalMinutes={totalMinutes}
						selected={startTime}
						onSelect={(next) => {
							onStartTimeChange(next);
							setTimeOpen(false);
						}}
					/>
				</PopoverContent>
			</Popover>
		</div>
	);
};

interface TimeListProps {
	dayKey: string;
	todayKey: string;
	timezone?: string;
	items: BookingSlotItem[];
	totalMinutes: number;
	selected: string | null;
	onSelect: (startTime: string) => void;
}

/**
 * Los horarios del día, en una lista que se recorre.
 *
 * Se puede llegar a cualquiera sin la rueda del mouse: la barra de scroll es
 * visible y agarrable en todo el panel, las flechas del teclado mueven el foco
 * de una opción a la otra, e Inicio y Fin saltan a las puntas. Hay negocios
 * usando Polaria con mouses sin rueda, así que una lista larga que sólo se
 * recorra rodando es una lista a la que no llegan.
 */
const TimeList: React.FC<TimeListProps> = ({
	dayKey,
	todayKey,
	timezone,
	items,
	totalMinutes,
	selected,
	onSelect,
}) => {
	const listRef = useRef<HTMLDivElement>(null);

	const { options, isPast, isLoading, isError } = useBookingTimeOptions({
		date: dayKey,
		todayKey,
		timezone,
		items,
		totalMinutes,
	});

	/*
	 * La opción elegida queda a la vista al abrir. Sin esto, una lista que
	 * arranca a las 8:00 abre en la mañana aunque la reserva sea a las 18:00, y
	 * lo elegido no aparece por ningún lado.
	 */
	useEffect(() => {
		if (options.length === 0) return;

		listRef.current
			?.querySelector('[data-selected="true"]')
			?.scrollIntoView({ block: 'center' });
	}, [options.length]);

	/** Flechas, Inicio y Fin mueven el foco entre las opciones. */
	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
		if (!keys.includes(event.key)) return;

		const buttons = Array.from(
			listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [],
		);
		if (buttons.length === 0) return;

		event.preventDefault();

		const current = buttons.indexOf(
			document.activeElement as HTMLButtonElement,
		);
		const next =
			event.key === 'Home'
				? 0
				: event.key === 'End'
					? buttons.length - 1
					: event.key === 'ArrowDown'
						? Math.min(current + 1, buttons.length - 1)
						: Math.max(current - 1, 0);

		buttons[current === -1 ? 0 : next]?.focus();
	};

	if (isLoading) {
		return (
			<div className="flex justify-center py-8">
				<Spinner className="size-4" />
			</div>
		);
	}

	if (isError) {
		return (
			<p className="p-3 text-sm text-red-600">
				No se pudieron cargar los horarios.
			</p>
		);
	}

	if (options.length === 0) {
		return (
			<p className="p-3 text-sm text-muted-foreground">
				{items.length > 1
					? 'Ese día no hay ningún horario en el que entren todos los servicios con sus profesionales.'
					: 'No quedan horarios ese día para ese servicio y ese profesional.'}
			</p>
		);
	}

	return (
		<div>
			{isPast && (
				<p className="border-b border-border px-3 py-2 text-xs text-muted-foreground">
					Se registra como atendida.
				</p>
			)}

			<div
				ref={listRef}
				role="listbox"
				aria-label="Horarios"
				tabIndex={-1}
				onKeyDown={handleKeyDown}
				className="max-h-72 overflow-y-auto p-1"
			>
				{options.map((option) => {
					const isSelected = option.startTime === selected;

					return (
						<button
							key={option.startTime}
							type="button"
							role="option"
							aria-selected={isSelected}
							data-selected={isSelected}
							onClick={() => onSelect(option.startTime)}
							className={cn(
								'flex w-full items-baseline justify-between gap-2 rounded-md px-3 py-2 text-left text-sm tabular-nums transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
								isSelected
									? 'bg-primary font-semibold text-primary-foreground'
									: 'hover:bg-muted',
							)}
						>
							{formatMinute(option.minute)}
							{option.notice && (
								<span
									className={cn(
										'text-[11px]',
										isSelected ? 'opacity-80' : 'text-muted-foreground',
									)}
								>
									{option.notice}
								</span>
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
};

export default BookingWhenField;
