'use client';

import { AlertCircle, Eye, Pencil, Trash2 } from 'lucide-react';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from '@/components/ui/context-menu';
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
	onOpen: (client: ClientApi) => void;
	onEdit: (client: ClientApi) => void;
	onDelete: (client: ClientApi) => void;
}

/** El día en que se cargó, corto. La hora no aporta nada en una lista. */
const formatDate = (iso: string) =>
	new Intl.DateTimeFormat('es-BO', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
	}).format(new Date(iso));

/*
 * El encabezado no se va con el scroll: la lista se mueve debajo de él. Sin el
 * fondo opaco las filas se leerían por atrás, porque `sticky` no saca al `th`
 * del flujo de pintado.
 */
const HEAD = 'sticky top-0 z-10 border-b border-border bg-background';

/**
 * La cartera de clientes.
 *
 * La fila abre la ficha, no el editor. Es la diferencia con Equipo, donde el
 * click lleva directo a editar porque ahí la ficha *es* el formulario: de un
 * cliente lo primero que se quiere es mirarlo —cuándo vino, qué se hizo— y no
 * corregirle el nombre.
 *
 * Lo demás —editar, eliminar— vive en el menú del click derecho. Es el gesto
 * que el sistema operativo ya reservó para "las acciones de esto", así que no
 * hay que enseñarlo, y deja la fila entera para su único trabajo: abrir. Un
 * botón de acciones por fila competiría con ese click en cada renglón.
 *
 * La tabla scrollea adentro de su marco y no estira la página: el encabezado y
 * el buscador quedan siempre a la vista, que es desde donde se filtra.
 */
const ClientsTable: React.FC<Props> = ({
	clients,
	dialCode,
	onOpen,
	onEdit,
	onDelete,
}) => {
	/*
	 * En touch el menú se abre con una pulsación larga y, al soltar, el navegador
	 * todavía dispara el click: sin esto la ficha se abriría por debajo del menú
	 * que se acaba de abrir. El `data-state` lo pone el propio trigger.
	 */
	const open = (event: React.MouseEvent<HTMLElement>, client: ClientApi) => {
		if (event.currentTarget.dataset.state === 'open') return;
		onOpen(client);
	};

	const actions = (client: ClientApi) => (
		<ContextMenuContent>
			<ContextMenuItem onSelect={() => onOpen(client)}>
				<Eye />
				Ver detalle
			</ContextMenuItem>

			<ContextMenuItem onSelect={() => onEdit(client)}>
				<Pencil />
				Editar
			</ContextMenuItem>

			<ContextMenuSeparator />

			<ContextMenuItem variant="destructive" onSelect={() => onDelete(client)}>
				<Trash2 />
				Eliminar
			</ContextMenuItem>
		</ContextMenuContent>
	);

	return (
		<>
			{/* Escritorio */}
			<div className="hidden min-h-0 flex-1 overflow-hidden rounded-xl border border-border md:flex md:flex-col">
				<Table containerClassName="min-h-0 flex-1">
					<TableHeader>
						<TableRow>
							<TableHead className={HEAD}>Cliente</TableHead>
							<TableHead className={HEAD}>Teléfono</TableHead>
							<TableHead className={HEAD}>Origen</TableHead>
							<TableHead className={HEAD}>Se unió</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{clients.map((client) => (
							<ContextMenu key={client.id}>
								<ContextMenuTrigger asChild>
									<TableRow
										tabIndex={0}
										role="button"
										aria-label={`Ver la ficha de ${client.name ?? 'este cliente'}`}
										className="cursor-pointer data-[state=open]:bg-muted/50"
										onClick={(event) => open(event, client)}
										onKeyDown={(event) => {
											if (event.key === 'Enter' || event.key === ' ') {
												event.preventDefault();
												onOpen(client);
											}
										}}
									>
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
								</ContextMenuTrigger>

								{actions(client)}
							</ContextMenu>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Móvil */}
			<ul className="min-h-0 flex-1 space-y-2 overflow-y-auto md:hidden">
				{clients.map((client) => (
					<li key={client.id}>
						<ContextMenu>
							<ContextMenuTrigger asChild>
								<button
									type="button"
									onClick={(event) => open(event, client)}
									className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-muted/40 data-[state=open]:bg-muted/40"
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
								</button>
							</ContextMenuTrigger>

							{actions(client)}
						</ContextMenu>
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
