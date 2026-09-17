'use client';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
	/** Qué es este panel ahora mismo: "Nueva reserva", o el estado de la cita. */
	title: string;
	onClose: () => void;
}

/**
 * La barra de arriba de los paneles de reserva, sólo en móvil.
 *
 * Existe por una sola razón: a pantalla completa no hay afuera. En escritorio el
 * panel se cierra tocando la agenda que quedó al costado, y esa salida alcanza;
 * en un teléfono el drawer tapa todo, así que sin una "X" la única forma de
 * salir sería el botón de cancelar del pie, que en la edición ni siquiera
 * aparece cuando hay cambios sin guardar.
 *
 * El título no repite el encabezado de abajo —ahí está la fecha, que es lo que
 * define la reserva— sino lo que la fecha no dice: si esto es una reserva nueva
 * o una que ya existe y en qué estado está.
 */
const BookingMobileBar: React.FC<Props> = ({ title, onClose }) => (
	<div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-2 sm:hidden">
		<p className="truncate font-medium">{title}</p>

		<Button
			variant="ghost"
			size="icon-sm"
			aria-label="Cerrar el panel"
			onClick={onClose}
		>
			<X className="size-4" />
		</Button>
	</div>
);

export default BookingMobileBar;
