'use client';

import { AlertCircle } from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import type { ClientApi } from '@/types/appointments.types';
import ClientAvatar from './ClientAvatar';
import { formatClientPhone, SOURCE_LABELS } from './utils/phone';

interface Props {
	clients: ClientApi[];
	dialCode?: string;
}

/** El día en que se cargó, corto. La hora no aporta nada en una lista. */
const formatDate = (iso: string) =>
	new Intl.DateTimeFormat('es-BO', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	}).format(new Date(iso));

/**
 * La cartera de clientes.
 *
 * Todavía no se puede abrir una fila: la ficha llega junto con el click que la
 * abre, porque un click que sólo cambia la dirección y no muestra nada es una
 * pantalla rota. Cuando llegue, la fila va a abrir la ficha y no el editor —al
 * revés que en Equipo, donde la ficha *es* el formulario—.
 */
const ClientsTable: React.FC<Props> = ({ clients, dialCode }) => {
	return (
		<>
			{/* Escritorio */}
			<div className="hidden overflow-hidden rounded-xl border border-border md:block">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Cliente</TableHead>
							<TableHead>Teléfono</TableHead>
							<TableHead>Origen</TableHead>
							<TableHead>Se unió</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{clients.map((client) => (
							<TableRow key={client.id}>
								<TableCell>
									<span className="flex items-center gap-3">
										<ClientAvatar client={client} size="sm" />
										<span className="min-w-0">
											<span className="block truncate font-medium">
												{client.name || 'Sin nombre'}
											</span>
											{client.email && (
												<span className="block truncate text-xs text-muted-foreground">
													{client.email}
												</span>
											)}
										</span>
									</span>
								</TableCell>
								<TableCell className="text-sm text-muted-foreground">
									<PhoneCell client={client} dialCode={dialCode} />
								</TableCell>
								<TableCell className="text-sm text-muted-foreground">
									{client.createdVia
										? SOURCE_LABELS[client.createdVia]
										: 'Sin registrar'}
								</TableCell>
								<TableCell className="text-sm text-muted-foreground">
									{formatDate(client.createdAt)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Móvil */}
			<ul className="space-y-2 md:hidden">
				{clients.map((client) => (
					<li
						key={client.id}
						className="flex items-center gap-3 rounded-xl border border-border p-3"
					>
						<ClientAvatar client={client} size="sm" />
						<span className="min-w-0 flex-1">
							<span className="block truncate font-medium">
								{client.name || 'Sin nombre'}
							</span>
							<span className="mt-0.5 block truncate text-xs text-muted-foreground">
								<PhoneCell client={client} dialCode={dialCode} />
							</span>
						</span>
					</li>
				))}
			</ul>
		</>
	);
};

/**
 * El teléfono, o el aviso de que no lo tiene.
 *
 * Un cliente sin teléfono no es un dato faltante cualquiera: es alguien que no
 * se va a poder reconocer cuando escriba por WhatsApp, así que va a entrar como
 * un cliente nuevo y su historial va a quedar partido. Decirlo acá es lo que
 * hace que el negocio pueda arreglarlo.
 */
const PhoneCell: React.FC<{ client: ClientApi; dialCode?: string }> = ({
	client,
	dialCode,
}) =>
	client.phone ? (
		<span className="tabular-nums">
			{formatClientPhone(client.phone, dialCode)}
		</span>
	) : (
		<span className="flex items-center gap-1 text-amber-600 dark:text-amber-500">
			<AlertCircle className="size-3 shrink-0" />
			Sin teléfono
		</span>
	);

export default ClientsTable;
