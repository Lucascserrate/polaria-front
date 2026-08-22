'use client';

import { useState } from 'react';
import { Check, Scissors, User, X } from 'lucide-react';
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
import { formatMinute } from './utils/dayTimeline';
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
	onMarkAttended: (id: string) => void;
	onCancel: (id: string) => void;
	isUpdating?: boolean;
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
	isUpdating = false,
	detail,
}) => {
	const [confirmingCancel, setConfirmingCancel] = useState(false);

	const colors = STATUS_COLORS[appointment.status] ?? STATUS_COLORS.confirmed;
	const isOpen = OPEN_STATUSES.includes(appointment.status);
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
			>
			{/* Franja de color: identifica el estado sin ocupar ancho de texto. */}
			<span
				aria-hidden="true"
				className={cn('absolute top-0 left-0 h-full w-[3px]', colors.accent)}
			/>

			<Popover>
				<PopoverTrigger asChild>
					<button
						type="button"
						className="block h-full w-full rounded-sm text-left leading-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						{/*
						 * En una card de media hora la hora y el nombre comparten línea; a
						 * partir de dos líneas se apilan, que es más fácil de leer cuando
						 * hay lugar.
						 */}
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
							<Scissors className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
							{appointment.service}
						</p>
						<p className="text-muted-foreground">
							{getAppointmentStatusText(appointment.status)}
						</p>
					</div>

					{/*
					 * Estado del recordatorio, en el detalle y no en la card: es una
					 * pregunta que se hace de a una cita, no algo que se barra con la
					 * vista, y la card no tiene ancho para explicar un motivo.
					 */}
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

					{/*
					 * Acá había dos botones —Atender y Cancelar—. Se fueron al menú del
					 * click derecho: el detalle responde "qué es esta cita" y no tiene por
					 * qué ser también el lugar donde se la resuelve.
					 */}
				</PopoverContent>
			</Popover>

			{/*
			 * Atajo para la acción más frecuente. Aparece con el hover y con el foco
			 * de teclado, así que no queda fuera del alcance de quien no usa mouse; en
			 * táctil, el camino es el popover.
			 */}
			{isOpen && showQuickActions && (
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
						onClick={() => setConfirmingCancel(true)}
					>
						<X className="h-3.5 w-3.5" />
					</Button>
				</div>
			)}

			</ContextMenuTrigger>

			<ContextMenuContent>
				{isOpen ? (
					<>
						<ContextMenuItem
							disabled={isUpdating}
							onSelect={() => onMarkAttended(appointment.id)}
						>
							<Check />
							Marcar como atendida
						</ContextMenuItem>

						<ContextMenuSeparator />

						<ContextMenuItem
							variant="destructive"
							disabled={isUpdating}
							onSelect={() => setConfirmingCancel(true)}
						>
							<X />
							Cancelar reserva...
						</ContextMenuItem>
					</>
				) : (
					/*
					 * Una cita ya atendida o cancelada no se toca desde acá: se corrige
					 * en la pantalla de citas. El menú dice en qué estado quedó en lugar
					 * de abrirse vacío.
					 */
					<ContextMenuItem disabled>
						{getAppointmentStatusText(appointment.status)}
					</ContextMenuItem>
				)}
			</ContextMenuContent>

			<AlertDialog open={confirmingCancel} onOpenChange={setConfirmingCancel}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Cancelar la cita?</AlertDialogTitle>
						<AlertDialogDescription>
							{`La cita de ${appointment.clientName} a las ${formatMinute(startMinute)} deja de contar y su horario vuelve a ofrecerse.`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="flex justify-end gap-2">
						<AlertDialogCancel>Volver</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => onCancel(appointment.id)}
							className="bg-destructive hover:bg-destructive/90"
						>
							Cancelar cita
						</AlertDialogAction>
					</div>
				</AlertDialogContent>
			</AlertDialog>
		</ContextMenu>
	);
};

export default TimelineAppointmentCard;
