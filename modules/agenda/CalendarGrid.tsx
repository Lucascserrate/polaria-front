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

/**
 * Ancho mínimo de una columna. Debajo de esto la grilla scrollea al costado.
 *
 * Es el piso de "María": todas las columnas reparten el ancho en partes iguales
 * y ninguna baja de acá, así que un nombre corto no hace una columna angosta.
 * El techo es la columna misma —lo que no entra se recorta—, y no un ancho
 * máximo: con un solo profesional, o en la vista de día de `/my-agenda`, que es
 * de una sola columna, un máximo dejaría media pantalla en blanco.
 */
const MIN_COLUMN_WIDTH = 116;

/**
 * Minutos alrededor de la hora actual en los que la hora en punto no se dibuja.
 *
 * La regla mide 60px por hora, y la etiqueta de ahora es una píldora de unos
 * 18px de alto: a menos de esto, "04:00" y "03:53" se pisan y quedan dos
 * números encimados donde tendría que haber uno. Desaparece el de la hora en
 * punto, que es el que se puede deducir —arriba y abajo están sus vecinas— y no
 * el que dice qué hora es ahora.
 */
const HOUR_MARK_CLEARANCE = 15;

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
	 * El hueco elegido, que queda resaltado hasta que se suelte.
	 *
	 * Va acompañado de `slotAction`, que es lo que se dibuja ahí. Se recibe de
	 * afuera en vez de recordarlo acá porque quien decide cuándo se suelta es
	 * quien abre lo que aparece encima.
	 */
	selectedSlot?: { columnKey: string; minute: number } | null;
	/**
	 * Qué poner sobre el hueco elegido.
	 *
	 * Llega como nodo, igual que las citas: la grilla lo ubica en su lugar y no
	 * sabe qué es. Acá lo que hay es un menú, pero eso es asunto de la pantalla.
	 */
	slotAction?: React.ReactNode;
	/**
	 * La cabecera de una columna es clickeable.
	 *
	 * En la vista semanal lleva al día de esa columna: mirar la semana y querer
	 * entrar a un día es el gesto natural, y el nombre del día ya está ahí.
	 */
	onColumnSelect?: (columnKey: string) => void;
}

/**
 * Hace falta porque los menús y las vistas previas viven en portales: cuelgan de
 * `body`, así que en el DOM están fuera de la columna, pero React hace burbujear
 * sus eventos por el árbol de componentes y no por el DOM. Sin este filtro, un
 * click adentro del menú de un hueco llegaba a `handleClick` como si fuera un
 * click en la columna.
 *
 * Eso es lo que rompía la "X" de ese menú: cerraba el menú y el mismo click lo
 * volvía a abrir en el hueco que quedaba debajo de la cruz. Y mover el mouse por
 * encima del menú —o de la vista previa de una cita— iba iluminando los huecos de
 * atrás, como si la tarjeta fuera transparente al cursor.
 *
 * Se pregunta por `contains` y no por un atributo en cada cosa que se dibuja
 * encima: la regla no es de quién es el evento, sino si pasó dentro de la
 * columna. Así vale para cualquier cosa que se porte encima, ahora y después.
 */
const fromGrid = (event: React.MouseEvent<HTMLDivElement>) =>
	event.currentTarget.contains(event.target as Node);

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
	selectedSlot = null,
	slotAction,
	onColumnSelect,
}) => {
	const scrollRef = useRef<HTMLDivElement>(null);
	const lastScrolled = useRef<number | null>(null);

	/**
	 * El minuto que va etiquetado en la regla, o `null` si hoy no está a la vista.
	 *
	 * `nowMinute` llega siempre que el reloj corra, incluso mirando otra semana:
	 * quien decide si hay algo que marcar son las columnas, que son las que saben
	 * qué día muestran.
	 */
	const nowLabelMinute =
		nowMinute !== null && columns.some((column) => column.isToday)
			? nowMinute
			: null;

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
		if (!onSlotClick || !fromGrid(event)) return;

		const minute = slotAt(column, event);
		if (minute === null) return;

		onSlotClick(column.key, minute);
	};

	const handleMove = (
		column: CalendarColumn,
		event: React.MouseEvent<HTMLDivElement>,
	) => {
		/*
		 * Lo que viene de encima no mueve el resaltado, y tampoco lo apaga: al
		 * entrar a la tarjeta el `mouseleave` de la columna ya lo apagó. Devolverlo
		 * a `null` acá sería apagar el de *otra* columna, que es la que puede
		 * quedar debajo de un menú ancho.
		 */
		if (!onSlotClick || !fromGrid(event)) return;

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
						/*
						 * `min-w-0` y no `flex-1` a secas.
						 *
						 * Un ítem de flex no baja de su ancho mínimo de contenido, así que
						 * sin esto la columna de la cabecera medía lo que medía la palabra
						 * más larga del nombre —"Rodríguez"— mientras la del cuerpo, que no
						 * tiene texto, repartía en partes iguales. Las dos filas se
						 * dibujaban con anchos distintos y los nombres terminaban corridos
						 * respecto de sus citas. El nombre se recorta; la columna no se
						 * estira.
						 */
						<div
							key={column.key}
							className={cn(
								'min-w-0 flex-1 border-r border-border text-center last:border-r-0',
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
					{/*
					 * `z-25` y no `z-20`: la línea de ahora también va en 20 y se dibuja
					 * después, así que con la grilla corrida al costado le pasaba por
					 * encima a la regla —y ahora, encima de la etiqueta de la hora—. Más
					 * que 30 no puede ir, que es lo que tapa a la regla cuando se scrollea
					 * para abajo.
					 */}
					<div
						className="sticky left-0 z-25 shrink-0 border-r border-border bg-background"
						style={{ width: RULER_WIDTH }}
					>
						{HOUR_MARKS.map((minute) =>
							nowLabelMinute !== null &&
							Math.abs(minute - nowLabelMinute) < HOUR_MARK_CLEARANCE ? null : (
								<span
									key={minute}
									className="absolute right-2 -translate-y-1/2 font-mono text-[10px] tabular-nums text-muted-foreground"
									style={{ top: minute * PX_PER_MINUTE }}
								>
									{formatMinute(minute)}
								</span>
							),
						)}

						{/*
						 * La hora actual, en la regla y no colgando de la línea.
						 *
						 * Antes el único ancla era un punto al principio de cada columna,
						 * que con cinco profesionales son cinco puntos diciendo lo mismo y
						 * ninguno diciendo la hora. Acá está una sola vez, en la columna
						 * donde se leen todas las demás horas, y se queda pegada a la
						 * izquierda cuando la grilla se corre al costado.
						 */}
						{nowLabelMinute !== null && (
							<span
								className="absolute right-0 -translate-y-1/2 rounded-full border-2 border-sky-500 bg-background px-1.5 py-0.5 font-mono text-[10px] font-medium tabular-nums text-sky-600 dark:text-sky-400"
								style={{ top: nowLabelMinute * PX_PER_MINUTE }}
							>
								{formatMinute(nowLabelMinute)}
							</span>
						)}
					</div>

					{columns.map((column) => (
						/* Las mismas reglas de ancho que la cabecera. Cualquier diferencia
						   acá son los nombres corridos de sus columnas. */
						<div
							key={column.key}
							style={GRID_LINES}
							className={cn(
								'relative min-w-0 flex-1 border-r border-border last:border-r-0',
								column.isToday && 'bg-muted/20',
								onSlotClick && 'cursor-pointer',
							)}
							onClick={(event) => handleClick(column, event)}
							onMouseMove={(event) => handleMove(column, event)}
							onMouseLeave={() =>
								setHovered((previous) =>
									previous?.columnKey === column.key ? null : previous,
								)
							}
						>
							{/*
							 * El hueco elegido, con el menú pegado.
							 *
							 * Se resalta más fuerte que el del cursor: mientras el menú está
							 * abierto hay que poder ver de qué hueco salió, que en la vista
							 * semanal es además de qué día.
							 */}
							{selectedSlot?.columnKey === column.key && (
								/*
								 * Sin eventos, como el del cursor: lo único que hace este
								 * rectángulo es marcar dónde está el hueco, y el menú que
								 * cuelga de él vive en un portal, fuera de la grilla.
								 */
								<div
									className="pointer-events-none absolute inset-x-0 bg-sky-500/15 ring-2 ring-sky-500/60 ring-inset"
									style={{
										top: selectedSlot.minute * PX_PER_MINUTE,
										height: SLOT_MINUTES * PX_PER_MINUTE,
									}}
								>
									{slotAction}
								</div>
							)}

							{/*
							 * Debajo de las citas: ilumina el hueco, no la cita que hay
							 * encima. Y sin eventos, para no robarle el cursor a la columna.
							 *
							 * En el hueco ya elegido no se dibuja: serían dos marcos sobre el
							 * mismo rectángulo.
							 */}
							{hovered?.columnKey === column.key &&
								!(
									selectedSlot?.columnKey === column.key &&
									selectedSlot.minute === hovered.minute
								) && (
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
									className="pointer-events-none absolute inset-x-0 z-20 h-0.5 -translate-y-1/2 bg-sky-500"
									style={{ top: nowMinute * PX_PER_MINUTE }}
									aria-hidden="true"
								/>
							)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default CalendarGrid;
