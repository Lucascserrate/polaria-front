'use client';

import { ExternalLink, UserRound } from 'lucide-react';
import { clientRoute } from '@/constants/routes';
import ClientAvatar from '@/modules/clients/ClientAvatar';
import { formatClientPhone } from '@/modules/clients/utils/phone';
import type { DraftClient } from './useBookingDraft';

interface Props {
	client: DraftClient;
	dialCode?: string;
}

/**
 * De quién es la reserva que se está editando.
 *
 * Sólo lectura, y no por falta de tiempo: cambiar de quién es una cita no es
 * editarla. Si la reserva es de otra persona, lo que corresponde es cancelar
 * ésta y crear la que va, que es lo que deja el historial de cada cliente
 * contando lo que realmente pasó.
 *
 * Elegir cliente existe al **crear**, en `BookingClientPanel`, que es donde
 * todavía no hay ninguno.
 */
const BookingClientField: React.FC<Props> = ({ client, dialCode }) => (
	<div className="rounded-xl border border-border p-3">
		<p className="mb-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
			Cliente
		</p>

		<div className="flex items-start gap-3">
			{client.id ? (
				<ClientAvatar client={{ id: client.id, name: client.name }} />
			) : (
				<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
					<UserRound className="size-4 text-muted-foreground" />
				</span>
			)}

			<div className="min-w-0 flex-1">
				<p className="truncate font-medium">{client.name || 'Sin cliente'}</p>
				<p className="truncate text-xs text-muted-foreground">
					{client.phone
						? formatClientPhone(client.phone, dialCode)
						: 'Sin teléfono'}
				</p>
			</div>
		</div>

		{/*
		 * En una pestaña nueva, y no en ésta.
		 *
		 * La ficha es otra ruta, así que ir en la misma pestaña desmonta el drawer y
		 * se lleva los cambios sin guardar. Volver con el botón del navegador no los
		 * recupera: el borrador vive en memoria.
		 *
		 * Que sea otra pestaña además es lo que hace útil al enlace: se mira el
		 * historial de la persona *mientras* se le corrige el turno, que es
		 * justamente cuando interesa saber si suele faltar.
		 */}
		{client.id && (
			<a
				href={clientRoute(client.id)}
				target="_blank"
				rel="noopener noreferrer"
				className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
			>
				Ver ficha del cliente
				<ExternalLink className="size-3" aria-hidden="true" />
				<span className="sr-only">(se abre en una pestaña nueva)</span>
			</a>
		)}
	</div>
);

export default BookingClientField;
