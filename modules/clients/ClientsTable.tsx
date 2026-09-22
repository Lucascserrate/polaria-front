'use client';

import {
	AlertCircle,
	ArrowDown,
	ArrowUp,
	ChevronsUpDown,
	Eye,
	Pencil,
	Trash2,
} from 'lucide-react';
import {
	ContextMenu,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
	ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { ClientSort } from '@/services/clients/clients.service';
import type { ClientApi, ClientListItemApi } from '@/types/appointments.types';
import ClientAvatar from './ClientAvatar';
import { formatLastVisit, formatVisitDate } from './utils/lastVisit';
import { formatClientPhone, SOURCE_LABELS } from './utils/phone';

/** Por dónde está ordenada la lista. `by` sin valor es el orden por defecto. */
export interface ClientSortState {
	by?: ClientSort;
	order: 'asc' | 'desc';
}

export const DEFAULT_SORT: ClientSortState = { order: 'asc' };

/**
 * Hacia dónde ordena el primer click de cada columna.
 *
 * En "Última visita" es la fecha más vieja primero, que en pantalla se lee como
 * los que hace más días que no vienen: es la pregunta por la que se ordena esa
 * columna, y no al revés.
 */
const FIRST_ORDER: Record<ClientSort, 'asc' | 'desc'> = {
	name: 'asc',
	lastVisit: 'asc',
};

interface Props {
	clients: ClientListItemApi[];
	dialCode?: string;
	sort: ClientSortState;
	onSortChange: (sort: ClientSortState) => void;
	onOpen: (client: ClientApi) => void;
	onEdit: (client: ClientApi) => void;
	onDelete: (client: ClientApi) => void;
}

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
 *
 * Las columnas son las cuatro que se miran de una cartera: quién es, cómo se lo
 * contacta, por dónde llegó y hace cuánto que no viene. La fecha de alta no está
 * —vive en la ficha—: se mira una vez por cliente, y ocupaba el lugar del dato
 * que se mira todos los días.
 */
const ClientsTable: React.FC<Props> = ({
	clients,
	dialCode,
	sort,
	onSortChange,
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

	// Repetir columna invierte; cambiar de columna empieza por su lado útil.
	const toggle = (by: ClientSort) =>
		onSortChange(
			sort.by === by
				? { by, order: sort.order === 'asc' ? 'desc' : 'asc' }
				: { by, order: FIRST_ORDER[by] },
		);

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
							<SortableHead
								label="Cliente"
								column="name"
								sort={sort}
								onToggle={toggle}
							/>
							<TableHead className={HEAD}>Teléfono</TableHead>
							<TableHead className={HEAD}>Origen</TableHead>
							<SortableHead
								label="Última visita"
								column="lastVisit"
								sort={sort}
								onToggle={toggle}
							/>
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
										<TableCell className="text-sm">
											<LastVisitCell client={client} />
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
			<div className="flex min-h-0 flex-1 flex-col gap-2 md:hidden">
				<MobileSort sort={sort} onSortChange={onSortChange} />

				<ul className="min-h-0 flex-1 space-y-2 overflow-y-auto">
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
										<span className="shrink-0 text-xs">
											<LastVisitCell client={client} />
										</span>
									</button>
								</ContextMenuTrigger>

								{actions(client)}
							</ContextMenu>
						</li>
					))}
				</ul>
			</div>
		</>
	);
};

/**
 * Un encabezado que ordena.
 *
 * El botón está dentro del `th` y no es el `th` entero: así el área que responde
 * al click es exactamente el texto con su flecha, y no una franja de la que no
 * se sabe si hace algo.
 *
 * La flecha apagada de las columnas inactivas es lo que anuncia que se puede
 * ordenar. Sin ella habría que descubrirlo probando.
 */
const SortableHead: React.FC<{
	label: string;
	column: ClientSort;
	sort: ClientSortState;
	onToggle: (column: ClientSort) => void;
}> = ({ label, column, sort, onToggle }) => {
	const active = sort.by === column;
	const Icon = !active
		? ChevronsUpDown
		: sort.order === 'asc'
			? ArrowUp
			: ArrowDown;

	return (
		<TableHead
			className={HEAD}
			aria-sort={
				active ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'
			}
		>
			<button
				type="button"
				onClick={() => onToggle(column)}
				className="-mx-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
			>
				{label}
				<Icon
					aria-hidden
					className={cn(
						'size-3.5',
						active ? 'text-foreground' : 'text-muted-foreground/60',
					)}
				/>
			</button>
		</TableHead>
	);
};

/** Los órdenes del selector de móvil, donde no hay encabezado que clickear. */
const MOBILE_SORTS: {
	value: string;
	label: string;
	state: ClientSortState;
}[] = [
	{ value: 'recent', label: 'Últimos añadidos', state: DEFAULT_SORT },
	{
		value: 'lastVisit-asc',
		label: 'Hace más que no vienen',
		state: { by: 'lastVisit', order: 'asc' },
	},
	{
		value: 'lastVisit-desc',
		label: 'Vinieron hace poco',
		state: { by: 'lastVisit', order: 'desc' },
	},
	{
		value: 'name-asc',
		label: 'Nombre (A–Z)',
		state: { by: 'name', order: 'asc' },
	},
	{
		value: 'name-desc',
		label: 'Nombre (Z–A)',
		state: { by: 'name', order: 'desc' },
	},
];

/**
 * El mismo orden que da el encabezado, en un teléfono.
 *
 * En móvil la lista son tarjetas y no hay encabezado donde clickear, así que sin
 * esto ordenar sería una función que sólo existe en escritorio. Se nombra por lo
 * que se busca —"hace más que no vienen"— y no por columna y sentido, que es una
 * traducción que quien mira no tiene por qué hacer.
 */
const MobileSort: React.FC<{
	sort: ClientSortState;
	onSortChange: (sort: ClientSortState) => void;
}> = ({ sort, onSortChange }) => {
	const current =
		MOBILE_SORTS.find(
			(option) =>
				option.state.by === sort.by &&
				(!option.state.by || option.state.order === sort.order),
		) ?? MOBILE_SORTS[0];

	return (
		<Select
			value={current.value}
			onValueChange={(value) => {
				const option = MOBILE_SORTS.find((entry) => entry.value === value);
				if (option) onSortChange(option.state);
			}}
		>
			<SelectTrigger size="sm" className="w-full" aria-label="Ordenar la lista">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				{MOBILE_SORTS.map((option) => (
					<SelectItem key={option.value} value={option.value}>
						{option.label}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
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
		<span className="flex items-center gap-1 text-warning">
			<AlertCircle className="size-3 shrink-0" />
			Sin teléfono
		</span>
	);

/**
 * Hace cuánto que no viene, no cuándo vino.
 *
 * Es el dato con el que se decide a quién escribirle hoy: hay negocios que
 * llaman a cada cliente a los veintiún días, y esa cuenta hecha fila por fila
 * sobre una fecha es justo lo que hace que no se haga. La fecha exacta queda en
 * el `title` y en la ficha, para cuando sí importa.
 */
const LastVisitCell: React.FC<{ client: ClientListItemApi }> = ({ client }) => {
	const { lastVisitAt } = client;
	const label = formatLastVisit(lastVisitAt);

	if (!lastVisitAt || !label) {
		return <span className="text-muted-foreground">Nunca vino</span>;
	}

	return (
		<span
			className="text-muted-foreground"
			title={formatVisitDate(lastVisitAt)}
		>
			{label}
		</span>
	);
};

export default ClientsTable;
