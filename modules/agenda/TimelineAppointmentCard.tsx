'use client';

import { useState } from 'react';
import { BookOpen, Check, Pencil, Trash2, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
	getAppointmentStatusText,
	STATUS_COLORS,
} from '@/modules/appointments/utils/constants';
import type {
	Appointment,
	AppointmentStatus,
} from '@/types/appointments.types';
import { formatMinute } from './utils/calendarLayout';
import { blockSchemeOf } from './utils/blockColor';
import { describeReminder } from './utils/reminderStatus';
import { cn } from '@/lib/utils';
import {
	DETAIL_HEIGHT,
	QUICK_ACTIONS_HEIGHT,
	SINGLE_LINE_HEIGHT,
} from './utils/constants';

/**
 * Estados en los que la cita todavía espera una resolución. Solo ahí tiene
 * sentido ofrecer las acciones: una cita ya atendida o cancelada no se toca
 * desde acá, se corrige en la pantalla de citas.
 */
const OPEN_STATUSES: AppointmentStatus[] = ['pending', 'confirmed'];

interface Props {
	appointment: Appointment;
	startMinute: number;
	endMinute: number;
	height: number;
	/**
	 * Las acciones son opcionales, y su ausencia es lo que hace la card de solo
	 * lectura.
	 *
	 * La usa así la agenda de un profesional, que muestra su día pero no lo edita:
	 * resolver o cancelar una cita sigue siendo del negocio. Pasar funciones vacías
	 * habría dibujado los mismos botones sin que hicieran nada, que es peor que no
	 * tenerlos —ofrece algo y después no responde—.
	 */
	onMarkAttended?: (id: string) => void;
	onCancel?: (id: string) => void;
	onEdit?: (id: string) => void;
	onDelete?: (id: string) => void;
	isUpdating?: boolean;
	/**
	 * El profesional de la columna, cuando la columna es una persona.
	 *
	 * Solo llega en la vista por profesional. En la semanal viene vacío y el color
	 * se deduce de los tramos: ver `blockSchemeOf`.
	 */
	staffId?: string | null;
	/**
	 * Segunda línea de la card. Por defecto, profesional y servicio.
	 *
	 * En la agenda por profesional se pasa el servicio del tramo: el nombre ya lo
	 * dice la columna, y en una cita compartida diría "Varios" en las dos.
	 */
	detail?: string;
}

/**
 * Una cita dentro de la agenda diaria.
 *
 * La card muestra solo información porque **ni el ancho ni el alto son suyos**:
 * el ancho lo reparten las citas simultáneas y el alto es la duración, o sea
 * 30px para media hora. Por eso el contenido se adapta en tres escalones —una
 * línea, dos, y con botones— en vez de dibujar siempre lo mismo y recortarlo.
 *
 * Lo que nunca se cae es la hora y el cliente: es lo que se busca al barrer la
 * agenda con la vista. El servicio es información de segundo orden y el detalle
 * completo vive en el popover, que además es la única forma de llegar a él desde
 * una pantalla táctil.
 *
 * Las acciones viven en el menú del click derecho y no en el detalle: son dos
 * gestos distintos —"quiero saber" y "quiero hacer"— y mezclarlos obligaba a
 * abrir el detalle para resolver algo que ya se sabía al ver la card.
 */
const TimelineAppointmentCard: React.FC<Props> = ({
	appointment,
	startMinute,
	endMinute,
	height,
	onMarkAttended,
	onCancel,
	onEdit,
	onDelete,
	isUpdating = false,
	detail,
	staffId,
}) => {
	const [confirming, setConfirming] = useState<'cancel' | 'delete' | null>(
		null,
	);

	const colors = STATUS_COLORS[appointment.status] ?? STATUS_COLORS.confirmed;
	const isOpen = OPEN_STATUSES.includes(appointment.status);

	/**
	 * El color del profesional, o `null` si a esta cita no le corresponde ninguno
	 * —compartida entre dos, o sin asignar—.
	 *
	 * Se reparte así entre color y estado:
	 *
	 * - **La barra lateral siempre lleva el color de la persona.** Es la respuesta a
	 *   "de quién es esto", que es para lo que existe el color, y en la vista
	 *   semanal —donde las citas de todo el equipo se mezclan en una columna— es la
	 *   única forma de saberlo sin abrir la card.
	 * - **El fondo lo tiñe la persona solo mientras la cita está abierta.** Atendida
	 *   y cancelada tienen su propio tratamiento y lo conservan: ahí el dato que
	 *   importa primero es que ya se resolvió, no de quién era.
	 *
	 * Lo que se pierde con esto es la distinción de hue entre pendiente y
	 * confirmada, que la barra llevaba antes. Era `blue-500` contra `sky-500` en
	 * 3 píxeles: dos azules contiguos que en la práctica nadie podía separar. El
	 * estado sigue estando escrito en la card y en el menú.
	 */
	const staffScheme = blockSchemeOf(appointment.segments ?? [], staffId);
	const isCancelled = appointment.status === 'cancelled';
	const isCompleted = appointment.status === 'completed';
	const inline = height < SINGLE_LINE_HEIGHT;
	const showDetail = height >= DETAIL_HEIGHT;
	const showQuickActions = height >= QUICK_ACTIONS_HEIGHT;
	const reminder = describeReminder(appointment.reminder);
	const timeRange = `${formatMinute(startMinute)}–${formatMinute(endMinute)}`;

	return (
		<ContextMenu>
			<ContextMenuTrigger
				className={cn(
					'group relative block h-full overflow-hidden rounded-md border py-0.5 pr-1 pl-1.5 text-left transition-shadow hover:shadow-md',
					colors.surface,
				)}
				/*
				 * El tinte va como `background-image` y no como capa aparte ni como
				 * `background-color`.
				 *
				 * No como capa porque un `absolute` se pinta **después** del contenido
				 * estático de su hermano, así que un `inset-0` translúcido quedaría
				 * velando el texto de la cita. Y no como `background-color` porque el
				 * tinte es translúcido y necesita el fondo opaco que trae
				 * `colors.surface`: sin él se vería la grilla a través. Un degradado de
				 * un solo color compone las dos capas en la misma propiedad.
				 */
				style={
					staffScheme && isOpen
						? {
								backgroundImage: `linear-gradient(${staffScheme.tint}, ${staffScheme.tint})`,
							}
						: undefined
				}
			>
				<span
					aria-hidden="true"
					className={cn(
						'absolute top-0 left-0 h-full w-0.75',
						!staffScheme && colors.accent,
					)}
					style={staffScheme ? { backgroundColor: staffScheme.hex } : undefined}
				/>

				<Popover>
					<PopoverTrigger asChild>
						<button
							type="button"
							className="block h-full w-full rounded-sm text-left leading-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<span
								className={cn(
									'flex min-w-0 items-center gap-1',
									!inline && 'flex-wrap',
								)}
							>
								<span className="shrink-0 font-mono text-[10px] tabular-nums text-foreground">
									{formatMinute(startMinute)}
								</span>

								{isCompleted && (
									<Check
										className="h-3 w-3 shrink-0 text-green-600 dark:text-green-400"
										aria-label="Atendida"
									/>
								)}

								{inline && (
									<span
										className={cn(
											'min-w-0 flex-1 truncate text-[11px] font-medium',
											isCancelled
												? 'text-muted-foreground line-through'
												: 'text-foreground',
										)}
									>
										{appointment.clientName}
									</span>
								)}
							</span>

							{!inline && (
								<span
									className={cn(
										'block truncate text-[11px] font-medium',
										isCancelled
											? 'text-muted-foreground line-through'
											: 'text-foreground',
									)}
								>
									{appointment.clientName}
								</span>
							)}

							{showDetail && (
								<span className="block truncate text-[10px] text-muted-foreground">
									{detail ?? `${appointment.staff} · ${appointment.service}`}
								</span>
							)}
						</button>
					</PopoverTrigger>

					<PopoverContent align="start" className="w-64 space-y-3">
						<div className="space-y-1">
							<p className="text-sm font-semibold">{appointment.clientName}</p>
							<p className="text-xs text-muted-foreground tabular-nums">
								{timeRange}
							</p>
						</div>

						<div className="space-y-1 text-xs">
							<p className="flex items-center gap-2">
								<User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
								{appointment.staff}
							</p>
							<p className="flex items-center gap-2">
								<BookOpen className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
								{appointment.service}
							</p>
							<p className="text-muted-foreground">
								{getAppointmentStatusText(appointment.status)}
							</p>
						</div>

						{reminder && (
							<p
								className={`border-t border-border pt-3 text-xs ${
									reminder.tone === 'warning'
										? 'text-amber-600 dark:text-amber-500'
										: 'text-muted-foreground'
								}`}
							>
								{reminder.label}
							</p>
						)}
					</PopoverContent>
				</Popover>

				{/*
				 * Atajo para la acción más frecuente. Aparece con el hover y con el foco
				 * de teclado, así que no queda fuera del alcance de quien no usa mouse; en
				 * táctil, el camino es el popover.
				 */}
				{isOpen && showQuickActions && onMarkAttended && onCancel && (
					<div className="absolute top-1 right-1 hidden gap-0.5 group-hover:flex group-focus-within:flex">
						<Button
							type="button"
							size="sm"
							variant="secondary"
							className="h-6 w-6 p-0 shadow-sm"
							aria-label={`Marcar como atendida la cita de ${appointment.clientName}`}
							disabled={isUpdating}
							onClick={() => onMarkAttended(appointment.id)}
						>
							<Check className="h-3.5 w-3.5" />
						</Button>
						<Button
							type="button"
							size="sm"
							variant="secondary"
							className="h-6 w-6 p-0 shadow-sm"
							aria-label={`Cancelar la cita de ${appointment.clientName}`}
							disabled={isUpdating}
							onClick={() => setConfirming('cancel')}
						>
							<X className="h-3.5 w-3.5" />
						</Button>
					</div>
				)}
			</ContextMenuTrigger>

			<ContextMenuContent>
				{isOpen && onMarkAttended && onCancel ? (
					<>
						<ContextMenuItem
							disabled={isUpdating}
							onSelect={() => onMarkAttended(appointment.id)}
						>
							<Check />
							Marcar como atendida
						</ContextMenuItem>

						{onEdit && (
							<ContextMenuItem onSelect={() => onEdit(appointment.id)}>
								<Pencil />
								Editar reserva
							</ContextMenuItem>
						)}

						<ContextMenuSeparator />

						<ContextMenuItem
							variant="destructive"
							disabled={isUpdating}
							onSelect={() => setConfirming('cancel')}
						>
							<X />
							Cancelar reserva...
						</ContextMenuItem>
					</>
				) : (
					/*
					 * Sin acciones el menú no queda vacío: dice el estado.
					 *
					 * Cubre dos casos que llegan al mismo lugar. Una cita ya atendida o
					 * cancelada no se resuelve desde acá porque eso ya pasó; y en la agenda
					 * de un profesional no hay nada que resolver porque no es su decisión.
					 * En los dos, lo útil es el estado.
					 */
					<ContextMenuItem disabled>
						{getAppointmentStatusText(appointment.status)}
					</ContextMenuItem>
				)}

				{/*
				 * Eliminar vale en cualquier estado, y por eso está afuera del bloque
				 * anterior: una prueba o una carga duplicada hay que poder sacarla igual
				 * de la agenda, esté pendiente, atendida o cancelada.
				 */}
				{onDelete && (
					<>
						<ContextMenuSeparator />
						<ContextMenuItem
							variant="destructive"
							onSelect={() => setConfirming('delete')}
						>
							<Trash2 />
							Eliminar reserva...
						</ContextMenuItem>
					</>
				)}
			</ContextMenuContent>

			<AlertDialog
				open={confirming !== null}
				onOpenChange={(open) => {
					if (!open) setConfirming(null);
				}}
			>
				<AlertDialogContent>
					{confirming === 'delete' ? (
						<>
							<AlertDialogHeader>
								<AlertDialogTitle>
									¿Estás seguro de que querés eliminar esta reserva?
								</AlertDialogTitle>
								<AlertDialogDescription>
									Esta acción elimina la reserva de forma permanente y no se
									puede recuperar.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<div className="flex justify-end gap-2">
								<AlertDialogCancel>Cancelar</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => onDelete?.(appointment.id)}
									className="bg-destructive hover:bg-destructive/90"
								>
									Eliminar reserva
								</AlertDialogAction>
							</div>
						</>
					) : (
						<>
							<AlertDialogHeader>
								<AlertDialogTitle>¿Cancelar la cita?</AlertDialogTitle>
								<AlertDialogDescription>
									{`La cita de ${appointment.clientName} a las ${formatMinute(startMinute)} deja de contar y su horario vuelve a ofrecerse.`}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<div className="flex justify-end gap-2">
								<AlertDialogCancel>Volver</AlertDialogCancel>
								<AlertDialogAction
									onClick={() => onCancel?.(appointment.id)}
									className="bg-destructive hover:bg-destructive/90"
								>
									Cancelar cita
								</AlertDialogAction>
							</div>
						</>
					)}
				</AlertDialogContent>
			</AlertDialog>
		</ContextMenu>
	);
};

export default TimelineAppointmentCard;
