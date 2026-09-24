'use client';

import { EllipsisVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	APPOINTMENT_STATUS,
	getAppointmentStatusText,
} from '@/modules/appointments/utils/constants';
import type { AppointmentStatus } from '@/types/appointments.types';

const STATUSES = Object.values(APPOINTMENT_STATUS) as AppointmentStatus[];

/**
 * El estado y el borrado de una reserva, desde el panel de la reserva.
 *
 * Estaban sólo en el menú del click derecho de la tarjeta, y ese menú no existe
 * en una tableta: quedaba el mantener apretado, que es un gesto que hay que
 * conocer de antes. Acá se llega tocando la cita, que es lo que cualquiera hace
 * primero.
 *
 * El estado se puede cambiar a cualquier otro, también desde finalizada o
 * cancelada: una cita cargada en el pasado nace finalizada, y si no fue así hay
 * que poder corregirlo sin borrarla y cargarla de nuevo.
 *
 * Van en un menú y no en el pie a propósito: el pie es para lo que se viene a
 * hacer —finalizar, guardar—, y lo destructivo al lado de eso es pedir un
 * accidente.
 *
 * Cancelar y eliminar piden confirmación y no la ejecutan: quien lo usa es el que
 * sabe cómo preguntar. Ver `AppointmentConfirmDialog`.
 */
const BookingActionsMenu: React.FC<{
	status: AppointmentStatus;
	/** Mientras hay una petición en vuelo: ver `disabled` del panel. */
	disabled?: boolean;
	onStatusChange: (status: AppointmentStatus) => void;
	onRequestDelete: () => void;
}> = ({ status, disabled = false, onStatusChange, onRequestDelete }) => (
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
			<DropdownMenuLabel className="text-xs text-muted-foreground">
				Estado
			</DropdownMenuLabel>
			<DropdownMenuRadioGroup
				value={status}
				onValueChange={(next) => {
					if (next !== status) onStatusChange(next as AppointmentStatus);
				}}
			>
				{STATUSES.map((option) => (
					<DropdownMenuRadioItem key={option} value={option}>
						{getAppointmentStatusText(option)}
					</DropdownMenuRadioItem>
				))}
			</DropdownMenuRadioGroup>

			<DropdownMenuSeparator />

			<DropdownMenuItem variant="destructive" onSelect={onRequestDelete}>
				<Trash2 />
				Eliminar reserva...
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
);

export default BookingActionsMenu;
