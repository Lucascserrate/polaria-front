'use client';

import { useState } from 'react';
import {
	AlertCircle,
	ExternalLink,
	Search,
	UserPlus,
	UserRound,
	X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { clientRoute } from '@/constants/routes';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import ClientAvatar from '@/modules/clients/ClientAvatar';
import NewClientDialog from '@/modules/clients/NewClientDialog';
import { formatClientPhone } from '@/modules/clients/utils/phone';
import useGetClients from '@/services/clients/useGetClients';
import type { DraftClient } from './useBookingDraft';

/** Coincidencias que se ofrecen. Más que esto deja de ser una lista y es un padrón. */
const MAX_MATCHES = 6;

/** Menos que esto devuelve medio padrón y no ayuda a elegir. */
const MIN_SEARCH_LENGTH = 2;

interface Props {
	client: DraftClient;
	dialCode?: string;
	/** Ausente lo deja en lectura, que es lo que corresponde al editar. */
	onChange?: (client: DraftClient) => void;
}

/**
 * De quién es la reserva: se **elige**, no se escribe.
 *
 * Antes era un campo de texto libre y el nombre escrito creaba un cliente al
 * guardar. Ese era el último camino del sistema que producía clientes sin
 * teléfono: la unicidad es `(negocio, teléfono)`, así que "Ana" escrita dos veces
 * eran dos Anas con historiales separados, y ninguna de las dos se reconocía
 * cuando esa persona escribía por WhatsApp.
 *
 * Ahora se busca contra los clientes que ya existen y, si no está, se lo da de
 * alta con su teléfono en el momento. El alta es explícita y no un efecto de
 * escribir, así que abandonar la reserva no deja clientes fantasma: deja un
 * cliente que el negocio decidió cargar.
 *
 * Al editar es sólo lectura: cambiar de quién es la cita no es editarla.
 */
const BookingClientField: React.FC<Props> = ({
	client,
	dialCode,
	onChange,
}) => {
	const [term, setTerm] = useState('');
	const [adding, setAdding] = useState(false);

	const debouncedTerm = useDebouncedValue(term);
	const canSearch = !!onChange && debouncedTerm.trim().length >= MIN_SEARCH_LENGTH;

	const { data, isFetching } = useGetClients(
		{ search: debouncedTerm.trim(), limit: MAX_MATCHES },
		{ enabled: canSearch },
	);

	const matches = data?.items ?? [];

	// Elegido, o en lectura: se muestra la ficha en chico y no el buscador.
	if (client.id || !onChange) {
		return (
			<Panel>
				<div className="flex items-start gap-3">
					{client.id ? (
						<ClientAvatar client={{ id: client.id, name: client.name }} />
					) : (
						<span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted">
							<UserRound className="size-4 text-muted-foreground" />
						</span>
					)}

					<div className="min-w-0 flex-1">
						<p className="truncate font-medium">
							{client.name || 'Sin cliente'}
						</p>
						<p className="truncate text-xs text-muted-foreground">
							{client.phone
								? formatClientPhone(client.phone, dialCode)
								: 'Sin teléfono'}
						</p>
					</div>

					{onChange && (
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="Elegir otro cliente"
							onClick={() => {
								setTerm('');
								onChange({ id: null, name: '', phone: null });
							}}
						>
							<X className="size-4" />
						</Button>
					)}
				</div>

				{/*
				 * En una pestaña nueva, y no en ésta.
				 *
				 * La ficha es otra ruta, así que ir en la misma pestaña desmonta el
				 * drawer y se lleva la reserva a medio armar —los servicios elegidos, el
				 * horario— o los cambios sin guardar de una que se estaba editando.
				 * Volver con el botón del navegador no los recupera: el borrador vive en
				 * memoria.
				 *
				 * Que sea otra pestaña además es lo que hace útil al enlace: se mira el
				 * historial de la persona *mientras* se le arma el turno, que es
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
			</Panel>
		);
	}

	return (
		<Panel>
			<div className="relative">
				<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					autoFocus
					value={term}
					className="pl-9"
					placeholder="Buscar por nombre, teléfono o email"
					aria-label="Buscar cliente"
					onChange={(event) => setTerm(event.target.value)}
				/>
			</div>

			<div className="mt-2 space-y-1">
				<button
					type="button"
					onClick={() => setAdding(true)}
					className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-muted/60"
				>
					<span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dashed border-border">
						<UserPlus className="size-4 text-muted-foreground" />
					</span>
					<span className="font-medium">Añadir un cliente nuevo</span>
				</button>

				{canSearch && isFetching && matches.length === 0 && (
					<div className="flex justify-center py-4">
						<Spinner className="size-4" />
					</div>
				)}

				{canSearch && !isFetching && matches.length === 0 && (
					<p className="px-2 py-4 text-center text-sm text-muted-foreground">
						Nadie coincide con esa búsqueda.
					</p>
				)}

				{matches.map((entry) => (
					<button
						key={entry.id}
						type="button"
						onClick={() =>
							onChange({
								id: entry.id,
								name: entry.name ?? '',
								phone: entry.phone,
							})
						}
						className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60"
					>
						<ClientAvatar client={entry} size="sm" />
						<span className="min-w-0 flex-1">
							<span className="block truncate text-sm font-medium">
								{entry.name || 'Sin nombre'}
							</span>
							{/*
							 * El teléfono y no el email: es lo único que distingue a dos
							 * personas que se llaman igual, que es exactamente el caso en el
							 * que hace falta elegir bien. Cuando falta se dice, porque un
							 * guion no explica por qué dos filas se ven idénticas.
							 */}
							{entry.phone ? (
								<span className="block truncate text-xs tabular-nums text-muted-foreground">
									{formatClientPhone(entry.phone, dialCode)}
								</span>
							) : (
								<span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-500">
									<AlertCircle className="size-3 shrink-0" />
									Sin teléfono
								</span>
							)}
						</span>
					</button>
				))}
			</div>

			<NewClientDialog
				open={adding}
				dialCode={dialCode}
				onOpenChange={setAdding}
				onCreated={(created) =>
					onChange({
						id: created.id,
						name: created.name ?? '',
						phone: created.phone,
					})
				}
			/>
		</Panel>
	);
};

const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<div className="rounded-xl border border-border p-3">
		<p className="mb-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
			Cliente
		</p>
		{children}
	</div>
);

export default BookingClientField;
