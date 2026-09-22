'use client';

import { EllipsisVertical, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OPEN_STATUSES } from '@/modules/appointments/utils/constants';
import type { AppointmentStatus } from '@/types/appointments.types';

/**
 * Cancelar y eliminar una reserva, desde el panel de la reserva.
 *
 * Estaban sólo en el menú del click derecho de la tarjeta, y ese menú no existe
 * en una tableta: quedaba el mantener apretado, que es un gesto que hay que
 * conocer de antes —quien no lo sabe no tiene forma de descubrir que cancelar
 * una cita era posible—. Acá se llega tocando la cita, que es lo que cualquiera
 * hace primero.
 *
 * Van en un menú y no como dos botones en el pie a propósito: el pie es para lo
 * que se viene a hacer —finalizar, guardar—, y dos botones destructivos al lado
 * de esos es pedir un accidente. El menú las tiene a un toque de distancia, pero
 * no en el camino.
 *
 * Las dos piden confirmación y no la ejecutan: por eso llegan como
 * `onRequestCancel` / `onRequestDelete`. Quien lo usa es el que sabe cómo
 * preguntar. Ver `AppointmentConfirmDialog`.
 */
const BookingActionsMenu: React.FC<{
	status: AppointmentStatus;
	/** Mientras hay una petición en vuelo: ver `disabled` del panel. */
	disabled?: boolean;
	onRequestCancel: () => void;
	onRequestDelete: () => void;
}> = ({ status, disabled = false, onRequestCancel, onRequestDelete }) => (
	<DropdownMenu>
		<DropdownMenuTrigger asChild>
			<Button
				variant="ghost"
				size="icon-sm"
				disabled={disabled}
				aria-label="Más acciones de la reserva"
			>
				<EllipsisVertical className="size-4" />
			</Button>
		</DropdownMenuTrigger>

		<DropdownMenuContent
			align="end"
			className="w-auto min-w-52"
			onCloseAutoFocus={(event) => event.preventDefault()}
		>
			{OPEN_STATUSES.includes(status) && (
				<>
					<DropdownMenuItem variant="destructive" onSelect={onRequestCancel}>
						<X />
						Cancelar reserva...
					</DropdownMenuItem>

					<DropdownMenuSeparator />
				</>
			)}

			<DropdownMenuItem variant="destructive" onSelect={onRequestDelete}>
				<Trash2 />
				Eliminar reserva...
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
);

export default BookingActionsMenu;
