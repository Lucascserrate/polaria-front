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
import type { Appointment, AppointmentStatus } from '@/types/appointments.types';
import { formatMinute } from './utils/dayTimeline';

/**
 * Estados en los que la cita todavía espera una resolución. Solo ahí tiene
 * sentido ofrecer las acciones: una cita ya atendida o cancelada no se toca
 * desde acá, se corrige en la pantalla de citas.
 */
const OPEN_STATUSES: AppointmentStatus[] = ['pending', 'booked', 'confirmed'];

/** Por debajo de esto no entra una segunda línea de texto sin apretujarla. */
const COMPACT_HEIGHT = 56;

interface Props {
	appointment: Appointment;
	startMinute: number;
	endMinute: number;
	height: number;
	onMarkAttended: (id: string) => void;
	onCancel: (id: string) => void;
	isUpdating?: boolean;
}

/**
 * Una cita dentro de la agenda diaria.
 *
 * La card muestra solo información porque el ancho no es suyo: con tres
 * profesionales simultáneos cada carril mide poco más de 130px, y dos botones
 * con texto no entran. Las acciones aparecen como íconos al pasar por encima o
 * al enfocar con el teclado, y el detalle completo vive en un popover al hacer
 * click, que además es la única forma de llegar a él desde una pantalla táctil.
 */
const TimelineAppointmentCard: React.FC<Props> = ({
	appointment,
	startMinute,
	endMinute,
	height,
	onMarkAttended,
	onCancel,
	isUpdating = false,
}) => {
	const [confirmingCancel, setConfirmingCancel] = useState(false);

	const colors = STATUS_COLORS[appointment.status] ?? STATUS_COLORS.booked;
	const isOpen = OPEN_STATUSES.includes(appointment.status);
	const isCancelled = appointment.status === 'cancelled';
	const isCompleted = appointment.status === 'completed';
	const isCompact = height < COMPACT_HEIGHT;
	const timeRange = `${formatMinute(startMinute)}–${formatMinute(endMinute)}`;

	return (
		<div
			className={`group relative h-full overflow-hidden rounded-md border pl-2 pr-1 py-1 text-left transition-shadow hover:shadow-md ${colors.surface}`}
		>
			{/* Franja de color: identifica el estado sin ocupar ancho de texto. */}
			<span
				aria-hidden="true"
				className={`absolute left-0 top-0 h-full w-1 ${colors.accent}`}
			/>

			<Popover>
				<PopoverTrigger asChild>
					<button
						type="button"
						className="block h-full w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
					>
						<span className="flex items-center gap-1">
							<span className="text-[11px] font-semibold tabular-nums text-foreground">
								{formatMinute(startMinute)}
							</span>
							{isCompleted && (
								<Check
									className="h-3 w-3 text-green-600 dark:text-green-400 shrink-0"
									aria-label="Atendida"
								/>
							)}
						</span>

						<span
							className={`block truncate text-xs font-medium ${
								isCancelled ? 'line-through text-muted-foreground' : 'text-foreground'
							}`}
						>
							{appointment.clientName}
						</span>

						{/*
						 * Profesional y servicio son la información de segundo orden: en una
						 * card corta se ocultan antes que la hora o el cliente, que es lo
						 * que se busca al barrer la agenda con la vista.
						 */}
						{!isCompact && (
							<span className="block truncate text-[11px] text-muted-foreground">
								{appointment.barber} · {appointment.service}
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
							{appointment.barber}
						</p>
						<p className="flex items-center gap-2">
							<Scissors className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
							{appointment.service}
						</p>
						<p className="text-muted-foreground">
							{getAppointmentStatusText(appointment.status)}
						</p>
					</div>

					{isOpen && (
						<div className="flex justify-end gap-2 border-t border-border pt-3">
							<Button
								size="sm"
								variant="ghost"
								className="text-muted-foreground"
								disabled={isUpdating}
								onClick={() => setConfirmingCancel(true)}
							>
								<X className="mr-1 h-4 w-4" />
								Cancelar
							</Button>
							<Button
								size="sm"
								disabled={isUpdating}
								onClick={() => onMarkAttended(appointment.id)}
							>
								<Check className="mr-1 h-4 w-4" />
								Atender
							</Button>
						</div>
					)}
				</PopoverContent>
			</Popover>

			{/*
			 * Atajo para la acción más frecuente. Aparece con el hover y con el foco
			 * de teclado, así que no queda fuera del alcance de quien no usa mouse; en
			 * táctil, el camino es el popover.
			 */}
			{isOpen && (
				<div className="absolute right-1 top-1 hidden gap-0.5 group-hover:flex group-focus-within:flex">
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
		</div>
	);
};

export default TimelineAppointmentCard;
