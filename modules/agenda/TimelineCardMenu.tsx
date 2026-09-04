'use client';

import { Check, Pencil, Trash2, X } from 'lucide-react';
import {
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
} from '@/components/ui/context-menu';
import {
	getAppointmentStatusText,
	OPEN_STATUSES,
} from '@/modules/appointments/utils/constants';
import type { Appointment } from '@/types/appointments.types';

/**
 * El menú del click derecho de una cita.
 *
 * Recibe el contenido del menú, no el `ContextMenu` entero: el disparador es la
 * card, que es la que sabe de su alto y su color, y partirlo así deja a cada uno
 * con lo suyo.
 *
 * Las dos acciones destructivas piden confirmación y no la ejecutan: por eso
 * llegan como `onRequestCancel` / `onRequestDelete`. Este componente no sabe cómo
 * se pide —ni le importa— y así no depende de cómo el padre guarda ese estado.
 * Que la función esté presente es además lo que dice si la acción se ofrece.
 */
const TimelineCardMenu: React.FC<{
	appointment: Appointment;
	isUpdating: boolean;
	onMarkAttended?: (id: string) => void;
	onEdit?: (id: string) => void;
	onRequestCancel?: () => void;
	onRequestDelete?: () => void;
}> = ({
	appointment,
	isUpdating,
	onMarkAttended,
	onEdit,
	onRequestCancel,
	onRequestDelete,
}) => {
	const isOpen = OPEN_STATUSES.includes(appointment.status);

	return (
		<ContextMenuContent>
			{isOpen && onMarkAttended && onRequestCancel ? (
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
						onSelect={onRequestCancel}
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
			{onRequestDelete && (
				<>
					<ContextMenuSeparator />
					<ContextMenuItem variant="destructive" onSelect={onRequestDelete}>
						<Trash2 />
						Eliminar reserva...
					</ContextMenuItem>
				</>
			)}
		</ContextMenuContent>
	);
};

export default TimelineCardMenu;
