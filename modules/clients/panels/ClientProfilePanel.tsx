'use client';

import { AlertCircle } from 'lucide-react';
import type { ClientApi } from '@/types/appointments.types';
import ClientAvatar from '../ClientAvatar';
import { formatClientPhone, SOURCE_LABELS } from '../utils/phone';

interface Props {
	client: ClientApi;
	dialCode?: string;
}

const formatDay = (iso: string | null | undefined) =>
	iso
		? new Intl.DateTimeFormat('es-BO', {
				day: 'numeric',
				month: 'long',
				year: 'numeric',
				// El cumpleaños llega como 'YYYY-MM-DD' y no lleva zona. Sin esto,
				// `new Date()` lo interpreta en UTC y a un negocio boliviano le muestra
				// el día anterior.
				timeZone: 'UTC',
			}).format(new Date(iso))
		: null;

/**
 * Quién es el cliente. La identidad y la ficha, juntas.
 *
 * En las referencias la foto, el nombre y el email viven en un panel propio, al
 * lado del nav. Acá bajan a esta sección: era una columna entera para repetir lo
 * que ya dice el encabezado del drawer, y sacarla le devuelve ese ancho al
 * historial de citas, que es lo que de verdad se lee en esta pantalla.
 *
 * Falta el botón de editar, que va junto a este título y a ningún otro lado: ver
 * un cliente y modificarlo son dos cosas distintas, y mezclarlas es lo que hace
 * que alguien cambie un dato sin querer mientras miraba. Aparece cuando exista
 * la pantalla que abre; un botón que lleva a un 404 no es media funcionalidad,
 * es una rota.
 */
const ClientProfilePanel: React.FC<Props> = ({ client, dialCode }) => (
	<div className="space-y-6">
		<div className="flex min-w-0 items-center gap-3">
			<ClientAvatar client={client} size="lg" className="size-14 text-lg" />
			<div className="min-w-0">
				<h3 className="truncate text-lg font-semibold">
					{client.name || 'Sin nombre'}
				</h3>
				<p className="truncate text-sm text-muted-foreground">
					{client.email || 'Sin email'}
				</p>
			</div>
		</div>

		<section>
			<h4 className="mb-3 text-sm font-semibold">Perfil</h4>
			<dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
				<Field label="Nombre" value={client.name} />
				<Field label="Email" value={client.email} />
				<Field
					label="Teléfono"
					value={
						client.phone ? formatClientPhone(client.phone, dialCode) : null
					}
					warning={
						client.phone
							? undefined
							: 'Sin teléfono no se lo reconoce si reserva por WhatsApp.'
					}
				/>
				<Field
					label="Fecha de nacimiento"
					value={formatDay(client.birthDate)}
				/>
				<Field
					label="Llegó por"
					value={
						client.createdVia ? SOURCE_LABELS[client.createdVia] : null
					}
				/>
				<Field label="Cliente desde" value={formatDay(client.createdAt)} />
			</dl>
		</section>

		{client.notes && (
			<section>
				<h4 className="mb-2 text-sm font-semibold">Notas</h4>
				<p className="rounded-xl border border-border p-3 text-sm whitespace-pre-wrap">
					{client.notes}
				</p>
			</section>
		)}
	</div>
);

/** Un dato de la ficha. El guion es el vacío, como en el resto del panel. */
const Field: React.FC<{
	label: string;
	value?: string | null;
	warning?: string;
}> = ({ label, value, warning }) => (
	<div className="min-w-0">
		<dt className="text-xs text-muted-foreground">{label}</dt>
		<dd className="mt-0.5 truncate text-sm">{value || '—'}</dd>
		{warning && (
			<p className="mt-1 flex items-start gap-1 text-xs text-amber-600 dark:text-amber-500">
				<AlertCircle className="mt-0.5 size-3 shrink-0" />
				{warning}
			</p>
		)}
	</div>
);

export default ClientProfilePanel;
