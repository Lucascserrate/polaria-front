'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Appointment } from '@/types/appointments.types';
import { formatMinute } from './utils/calendarLayout';

/** Qué se está confirmando, o `null` si no hay nada abierto. */
export type ConfirmingAction = 'cancel' | 'delete' | null;

/**
 * La confirmación de cancelar o eliminar una cita.
 *
 * Los dos casos comparten un diálogo y no uno cada uno porque nunca están
 * abiertos a la vez: `action` es lo que se está confirmando, y su ausencia es lo
 * que lo mantiene cerrado. Dos diálogos habrían sido dos estados que podían
 * contradecirse.
 *
 * El texto no es intercambiable. Cancelar libera el horario y la cita queda;
 * eliminar la borra y no se recupera, así que decirlo con las mismas palabras
 * sería esconder la diferencia justo donde hay que verla.
 */
const TimelineCardConfirmDialog: React.FC<{
	appointment: Appointment;
	startMinute: number;
	action: ConfirmingAction;
	onOpenChange: (open: boolean) => void;
	onCancel?: (id: string) => void;
	onDelete?: (id: string) => void;
}> = ({
	appointment,
	startMinute,
	action,
	onOpenChange,
	onCancel,
	onDelete,
}) => (
	<AlertDialog open={action !== null} onOpenChange={onOpenChange}>
		<AlertDialogContent>
			{action === 'delete' ? (
				<>
					<AlertDialogHeader>
						<AlertDialogTitle>
							¿Estás seguro de que querés eliminar esta reserva?
						</AlertDialogTitle>
						<AlertDialogDescription>
							Esta acción elimina la reserva de forma permanente y no se puede
							recuperar.
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
);

export default TimelineCardConfirmDialog;
