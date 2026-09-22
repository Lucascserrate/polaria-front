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
import describeAppointment from './utils/describeAppointment';

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
 *
 * Y es el mismo diálogo para las dos puertas que ofrecen estas acciones —el menú
 * de la tarjeta en la agenda y el de la reserva abierta—: una misma acción tiene
 * que advertir lo mismo, o la segunda puerta parece hacer algo distinto. Por eso
 * recibe el nombre y la hora ya escritos en vez de la cita: las dos pantallas
 * tienen la reserva en una forma distinta, y de ésta sólo hace falta cómo se lee.
 */
const AppointmentConfirmDialog: React.FC<{
	clientName?: string | null;
	timeLabel?: string | null;
	action: ConfirmingAction;
	onOpenChange: (open: boolean) => void;
	onCancel?: () => void;
	onDelete?: () => void;
}> = ({ clientName, timeLabel, action, onOpenChange, onCancel, onDelete }) => (
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
							onClick={onDelete}
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
							{`${describeAppointment(clientName, timeLabel)} deja de contar y su horario vuelve a ofrecerse.`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="flex justify-end gap-2">
						<AlertDialogCancel>Volver</AlertDialogCancel>
						<AlertDialogAction
							onClick={onCancel}
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

export default AppointmentConfirmDialog;
