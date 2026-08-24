'use client';

import { User } from 'lucide-react';

interface Props {
	name: string | null;
	phone: string | null;
}

/**
 * De quién es la reserva.
 *
 * En edición es solo lectura: cambiar de quién es la cita no es editarla, es otra
 * reserva. El teléfono se muestra porque es lo que sirve para llamar o escribir
 * cuando hay que avisar algo del turno.
 */
const BookingClientField: React.FC<Props> = ({ name, phone }) => (
	<div className="flex items-start gap-3 p-2">
		<span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
			<User className="h-4 w-4 text-muted-foreground" />
		</span>

		<div className="min-w-0">
			<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
				Cliente
			</p>
			<p className="truncate text-sm font-medium">{name ?? 'Sin cliente'}</p>
			<p className="text-xs text-muted-foreground">
				{phone ?? 'Sin teléfono'}
			</p>
		</div>
	</div>
);

export default BookingClientField;
