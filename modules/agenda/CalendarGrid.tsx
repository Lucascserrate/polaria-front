'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import {
	blockGeometry,
	DAY_MINUTES,
	formatMinute,
	HOUR_MARKS,
	isMinuteOpen,
	PX_PER_MINUTE,
	SLOT_MINUTES,
	closedRangesOf,
	slotMinuteAt,
	type MinuteRange,
} from './utils/calendarLayout';

/** Ancho de la regla de horas. La cabecera reserva lo mismo para no desalinearse. */
const RULER_WIDTH = 56;

/** Ancho mínimo de una columna. Debajo de esto la grilla scrollea al costado. */
const MIN_COLUMN_WIDTH = 116;

/**
 * Las líneas de la grilla se dibujan con degradados y no con elementos.
 *
 * Son 96 líneas por columna: con siete columnas serían más de 600 nodos que solo
 * existen para pintar un píxel. La de la hora en punto va primera porque la
 * primera capa se pinta arriba, y así tapa a la de los 15 minutos en vez de
 * quedar debajo.
 */
const GRID_LINES = {
	backgroundImage: [
		`repeating-linear-gradient(to bottom, var(--border) 0 1px, transparent 1px ${60 * PX_PER_MINUTE}px)`,
		`repeating-linear-gradient(to bottom, color-mix(in oklab, var(--border) 45%, transparent) 0 1px, transparent 1px ${30 * PX_PER_MINUTE}px)`,
	].join(', '),
};

/**
 * El rayado del horario cerrado.
 *
 * Es la pieza que sostiene la decisión de dibujar el día completo: el tiempo
 * existe en la grilla, pero se lee de un vistazo que ahí no se atiende.
 */
const CLOSED_PATTERN = {
	backgroundImage:
		'repeating-linear-gradient(45deg, color-mix(in oklab, var(--muted-foreground) 12%, transparent) 0 1.5px, transparent 1.5px 7px)',
};

export interface CalendarColumn {
	/** Identifica la columna: la fecha en la vista semanal, el profesional en la diaria. */
	key: string;
	header: React.ReactNode;
	/** Franjas de atención de esta columna. Lo que quede afuera se dibuja cerrado. */
	openRanges: MinuteRange[];
	/**
	 * Citas ya posicionadas. Se reciben como nodos porque la grilla no sabe —ni
	 * necesita saber— qué representa cada bloque.
	 */
	content?: React.ReactNode;
	/** Solo la columna del día en curso lleva la línea de ahora y el resaltado. */
	isToday?: boolean;
	/**
	 * Nombre de la acción de su cabecera, para quien la escucha en vez de verla:
	 * "lun 17" no dice que sea un botón ni a dónde lleva.
	 */
	selectLabel?: string;
}

interface Props {
	columns: CalendarColumn[];
	/** Minuto del día en que estamos. `null` cuando no hay que dibujarlo. */
	nowMinute?: number | null;
	/**
	 * Minuto al que se desplaza la vista. Se aplica cuando cambia el valor, no en
	 * cada render: arrastrar la vista mientras alguien lee la tarde sería peor que
	 * no desplazarla nunca.
	 */
	scrollToMinute?: number | null;
	/** Un hueco libre. No se llama en las horas cerradas. */
	onSlotClick?: (columnKey: string, minute: number) => void;
	/**
	 * La cabecera de una columna es clickeable.
	 *
	 * En la vista semanal lleva al día de esa columna: mirar la semana y querer
	 * entrar a un día es el gesto natural, y el nombre del día ya está ahí.
	 */
	onColumnSelect?: (columnKey: string) => void;
}

/**
 * La grilla del calendario: horas en vertical, columnas en horizontal.
 *
 * El lienzo son siempre las 24 horas, iguales en todas las columnas, y lo
 * cerrado se pinta encima. Por eso la grilla no sabe si está mostrando días o
 * profesionales: lo único que cambia entre una vista y la otra es qué columnas
 * recibe y qué franjas trae cada una.
 *
 * Un solo contenedor scrollea, con la cabecera pegada arriba y la regla pegada a
 * la izquierda. Con dos contenedores sincronizados a mano —uno para la cabecera
 * y otro para el cuerpo— cualquier diferencia de un píxel deja los días
 * corridos respecto de sus columnas.
 */
const CalendarGrid: React.FC<Props> = ({
	columns,
	nowMinute = null,
	scrollToMinute = null,
	onSlotClick,
	onColumnSelect,
}) => {
	const scrollRef = useRef<HTMLDivElement>(null);
	const lastScrolled = useRef<number | null>(null);

	/**
	 * La celda de 15 minutos bajo el cursor.
	 *
	 * Se resalta una sola, dibujada donde está el cursor, en lugar de tener 96
	 * celdas por columna con `:hover`: serían más de 600 elementos existiendo solo
	 * para poder iluminarse. El estado cambia únicamente al pasar de una celda a
	 * la siguiente, no en cada píxel del movimiento.
	 */
	const [hovered, setHovered] = useState<{
		columnKey: string;
		minute: number;
	} | null>(null);

	useEffect(() => {
		if (scrollToMinute === null) return;
		if (lastScrolled.current === scrollToMinute) return;

		const container = scrollRef.current;
		if (!container) return;

		lastScrolled.current = scrollToMinute;
		container.scrollTo({
			// Un tercio de la altura por encima: el minuto pedido queda a la vista
			// con algo de contexto arriba en lugar de pegado al borde.
			top: Math.max(
				0,
				scrollToMinute * PX_PER_MINUTE - container.clientHeight / 3,
			),
			behavior: 'smooth',
		});
	}, [scrollToMinute]);

	/**
	 * El hueco que hay bajo el cursor, o `null` si ahí no se puede agendar.
	 *
	 * Fuera del lienzo o en una hora cerrada no hay nada que crear. El bloque de
	 * cerrado ya se come el click; esto cubre el borde exacto y, sobre todo, evita
	 * iluminar una celda que no se puede elegir.
	 */
	const slotAt = (
		column: CalendarColumn,
		event: React.MouseEvent<HTMLDivElement>,
	): number | null => {
		const bounds = event.currentTarget.getBoundingClientRect();
		const minute = slotMinuteAt(event.clientY - bounds.top);

		if (minute === null || !isMinuteOpen(minute, column.openRanges))
			return null;

		return minute;
	};

	const handleClick = (
		column: CalendarColumn,
		event: React.MouseEvent<HTMLDivElement>,
	) => {
		if (!onSlotClick) return;

		const minute = slotAt(column, event);
		if (minute === null) return;

		onSlotClick(column.key, minute);
	};

	const handleMove = (
		column: CalendarColumn,
		event: React.MouseEvent<HTMLDivElement>,
	) => {
		if (!onSlotClick) return;

		/*
		 * Sobre una cita no se ilumina nada. El evento igual llega hasta acá —no se
		 * corta la propagación, porque al salir de la cita hay que volver a
		 * iluminar—, así que se pregunta de dónde viene.
		 */
		const overAppointment = (event.target as HTMLElement).closest(
			'[data-appointment]',
		);

		const minute = overAppointment ? null : slotAt(column, event);

		setHovered((previous) => {
			if (minute === null) {
				return previous?.columnKey === column.key ? null : previous;
			}

			// Sin esta comparación, cada píxel de movimiento sería un render.
			if (previous?.columnKey === column.key && previous.minute === minute) {
				return previous;
			}

			return { columnKey: column.key, minute };
		});
	};

	return (
		<div ref={scrollRef} className="h-full overflow-auto">
			<div
				className="relative flex min-w-full flex-col"
				style={{ minWidth: RULER_WIDTH + columns.length * MIN_COLUMN_WIDTH }}
			>
				{/* Cabecera */}
				<div className="sticky top-0 z-30 flex border-b border-border bg-background">
					<div
						className="sticky left-0 z-10 shrink-0 border-r border-border bg-background"
						style={{ width: RULER_WIDTH }}
					/>
					{columns.map((column) => (
						<div
							key={column.key}
							className={cn(
								'flex-1 border-r border-border text-center last:border-r-0',
								column.isToday && 'bg-muted/40',
							)}
						>
							{onColumnSelect ? (
								<button
									type="button"
									className="w-full cursor-pointer px-2 py-2 transition-colors hover:bg-muted/60"
									aria-label={column.selectLabel}
									title={column.selectLabel}
									onClick={() => onColumnSelect(column.key)}
								>
									{column.header}
								</button>
							) : (
								<div className="px-2 py-2">{column.header}</div>
							)}
						</div>
					))}
				</div>

				{/* Cuerpo */}
				<div className="flex" style={{ height: DAY_MINUTES * PX_PER_MINUTE }}>
					{/* Regla de horas. */}
					<div
						className="sticky left-0 z-20 shrink-0 border-r border-border bg-background"
						style={{ width: RULER_WIDTH }}
					>
						{HOUR_MARKS.map((minute) => (
							<span
								key={minute}
								className="absolute right-2 -translate-y-1/2 font-mono text-[10px] tabular-nums text-muted-foreground"
								style={{ top: minute * PX_PER_MINUTE }}
							>
								{formatMinute(minute)}
							</span>
						))}
					</div>

					{columns.map((column) => (
						<div
							key={column.key}
							className={cn(
								'relative flex-1 border-r border-border last:border-r-0',
								column.isToday && 'bg-muted/20',
								onSlotClick && 'cursor-pointer',
							)}
							style={GRID_LINES}
							onClick={(event) => handleClick(column, event)}
							onMouseMove={(event) => handleMove(column, event)}
							onMouseLeave={() =>
								setHovered((previous) =>
									previous?.columnKey === column.key ? null : previous,
								)
							}
						>
							{/*
							 * Debajo de las citas: ilumina el hueco, no la cita que hay
							 * encima. Y sin eventos, para no robarle el cursor a la columna.
							 */}
							{hovered?.columnKey === column.key && (
								<div
									className="pointer-events-none absolute inset-x-0 flex items-start bg-sky-500/10 ring-1 ring-sky-500/30 ring-inset"
									style={{
										top: hovered.minute * PX_PER_MINUTE,
										height: SLOT_MINUTES * PX_PER_MINUTE,
									}}
									aria-hidden="true"
								>
									<span className="px-1 font-mono text-[9px] leading-none text-sky-700 dark:text-sky-400">
										{formatMinute(hovered.minute)}
									</span>
								</div>
							)}

							{/* Horario cerrado. Se come el click: ahí no hay nada que agendar. */}
							{closedRangesOf(column.openRanges).map((range) => {
								const geometry = blockGeometry(range);
								return (
									<div
										key={`${range.startMinute}-${range.endMinute}`}
										className="absolute inset-x-0 cursor-default bg-muted/30"
										style={{
											top: geometry.top,
											height:
												(range.endMinute - range.startMinute) * PX_PER_MINUTE,
											...CLOSED_PATTERN,
										}}
										onClick={(event) => event.stopPropagation()}
										aria-hidden="true"
									/>
								);
							})}

							{column.content}

							{column.isToday && nowMinute !== null && (
								<div
									className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
									style={{ top: nowMinute * PX_PER_MINUTE }}
									aria-hidden="true"
								>
									<span className="-ml-1 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
									<span className="h-px flex-1 bg-sky-500" />
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default CalendarGrid;
