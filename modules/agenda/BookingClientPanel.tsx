'use client';

import { useState } from 'react';
import {
	AlertCircle,
	ExternalLink,
	Search,
	UserPlus,
	UserRound,
	UserRoundPlus,
	X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { clientRoute } from '@/constants/routes';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { cn } from '@/lib/utils';
import ClientAvatar from '@/modules/clients/ClientAvatar';
import NewClientDialog from '@/modules/clients/NewClientDialog';
import { formatClientPhone } from '@/modules/clients/utils/phone';
import useGetClients from '@/services/clients/useGetClients';
import type { DraftClient } from './useBookingDraft';

/** Cuántos se ofrecen. Más que esto deja de ser una lista y es un padrón. */
const MAX_MATCHES = 8;

interface Props {
	client: DraftClient;
	/**
	 * Ausente deja la columna en lectura, que es lo que corresponde al editar:
	 * cambiar de quién es una cita no es editarla. Si la reserva es de otra
	 * persona, lo que va es cancelar ésta y crear la que corresponde, que es lo
	 * que deja el historial de cada cliente contando lo que pasó de verdad.
	 */
	onChange?: (client: DraftClient) => void;
	dialCode?: string;
	/** Abierto muestra el buscador; cerrado, sólo el botón. */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

/**
 * De quién es la reserva, en una columna propia al costado del formulario.
 *
 * Está afuera del formulario por pasos y no adentro porque no es un paso: se
 * puede elegir el cliente antes, después o en el medio de armar la reserva, y
 * meterlo en la secuencia obligaría a pasar por él para llegar al servicio.
 * Cerrado ocupa lo que ocupa un botón; abierto se lleva el ancho que necesita
 * una búsqueda con su lista de resultados.
 *
 * El cliente se **elige**, no se escribe. Antes era un campo de texto libre y el
 * nombre escrito creaba un cliente al guardar: ése era el último camino del
 * sistema que producía clientes sin teléfono, y como la unicidad es `(negocio,
 * teléfono)`, "Ana" escrita dos veces eran dos Anas con historiales separados,
 * ninguna de las cuales se reconocía cuando esa persona escribía por WhatsApp.
 */
const BookingClientPanel: React.FC<Props> = ({
	client,
	onChange,
	dialCode,
	open = false,
	onOpenChange,
}) => {
	const [term, setTerm] = useState('');
	const [adding, setAdding] = useState(false);

	/** En lectura no hay nada que buscar: la columna es sólo la ficha. */
	const editable = Boolean(onChange);

	const debouncedTerm = useDebouncedValue(term);

	/*
	 * Se consulta con el buscador vacío también. La lista completa es lo que
	 * convierte esto en algo elegible sin saber a quién se busca: un negocio
	 * chico reconoce a su cliente al verlo antes de terminar de escribir el
	 * nombre.
	 */
	const { data, isFetching } = useGetClients(
		{ search: debouncedTerm.trim(), limit: MAX_MATCHES },
		{ enabled: editable && open && !client.id },
	);

	const matches = data?.items ?? [];

	return (
		<aside
			className={cn(
				'flex shrink-0 flex-col border-r border-border bg-muted/30 transition-[width] duration-200',
				editable && open && !client.id ? 'w-72' : 'w-44',
			)}
		>
			{client.id || !editable ? (
				<Chosen
					client={client}
					dialCode={dialCode}
					onClear={
						editable
							? () => {
									setTerm('');
									onChange?.({ id: null, name: '', phone: null });
									onOpenChange?.(true);
								}
							: undefined
					}
				/>
			) : !open ? (
				/*
				 * Ocupa la columna entera y no sólo su contenido.
				 *
				 * Es el único destino de esta columna mientras no haya cliente, así que
				 * todo lo que se ve a la izquierda tiene que llevar ahí: un botón del
				 * alto de su texto deja tres cuartos de columna que parecen clickeables
				 * y no hacen nada. El contenido se queda arriba, que es donde se lo
				 * busca.
				 */
				<button
					type="button"
					onClick={() => onOpenChange?.(true)}
					className="flex flex-1 flex-col items-center gap-2 px-4 pt-8 text-center transition-colors hover:bg-muted/60"
				>
					<span className="flex size-12 items-center justify-center rounded-full bg-background text-muted-foreground ring-1 ring-border">
						<UserRoundPlus className="size-5" />
					</span>
					<span className="text-sm font-semibold">Añadir cliente</span>
					<span className="text-xs leading-snug text-muted-foreground">
						Toda reserva es de alguien: hace falta para poder avisarle.
					</span>
				</button>
			) : (
				<div className="flex min-h-0 flex-1 flex-col">
					<div className="flex items-center gap-2 border-b border-border p-3">
						<div className="relative flex-1">
							<Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								autoFocus
								value={term}
								className="h-10 bg-background pl-9"
								placeholder="Buscar cliente"
								aria-label="Buscar cliente"
								onChange={(event) => setTerm(event.target.value)}
							/>
						</div>
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="Cerrar el buscador de clientes"
							onClick={() => onOpenChange?.(false)}
						>
							<X className="size-4" />
						</Button>
					</div>

					<div className="min-h-0 flex-1 overflow-y-auto p-2">
						<button
							type="button"
							onClick={() => setAdding(true)}
							className="mb-1 flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition-colors hover:bg-muted"
						>
							<span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-dashed border-border">
								<UserPlus className="size-4 text-muted-foreground" />
							</span>
							<span className="font-medium">Añadir un cliente nuevo</span>
						</button>

						{isFetching && matches.length === 0 && (
							<div className="flex justify-center py-4">
								<Spinner className="size-4" />
							</div>
						)}

						{!isFetching && matches.length === 0 && (
							<p className="px-2 py-4 text-center text-sm text-muted-foreground">
								{debouncedTerm.trim()
									? 'Nadie coincide con esa búsqueda.'
									: 'Todavía no hay clientes cargados.'}
							</p>
						)}

						{matches.map((entry) => (
							<button
								key={entry.id}
								type="button"
								onClick={() => {
									onChange?.({
										id: entry.id,
										name: entry.name ?? '',
										phone: entry.phone,
									});
									onOpenChange?.(false);
								}}
								className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted"
							>
								<ClientAvatar client={entry} size="sm" />
								<span className="min-w-0 flex-1">
									<span className="block truncate text-sm font-medium">
										{entry.name || 'Sin nombre'}
									</span>
									{/*
									 * El teléfono y no el email: es lo único que distingue a dos
									 * personas que se llaman igual, que es exactamente el caso en
									 * el que hace falta elegir bien. Cuando falta se dice, porque
									 * un guion no explica por qué dos filas se ven idénticas.
									 */}
									{entry.phone ? (
										<span className="block truncate text-xs tabular-nums text-muted-foreground">
											{formatClientPhone(entry.phone, dialCode)}
										</span>
									) : (
										<span className="flex items-center gap-1 text-xs text-warning">
											<AlertCircle className="size-3 shrink-0" />
											Sin teléfono
										</span>
									)}
								</span>
							</button>
						))}
					</div>
				</div>
			)}

			{editable && (
				<NewClientDialog
					open={adding}
					dialCode={dialCode}
					onOpenChange={setAdding}
					onCreated={(created) => {
						onChange?.({
							id: created.id,
							name: created.name ?? '',
							phone: created.phone,
						});
						onOpenChange?.(false);
					}}
				/>
			)}
		</aside>
	);
};

/** El cliente de la reserva. Con `onClear`, además, la salida para cambiarlo. */
const Chosen: React.FC<{
	client: DraftClient;
	dialCode?: string;
	onClear?: () => void;
}> = ({ client, dialCode, onClear }) => (
	<div className="flex flex-1 flex-col items-center gap-2 px-4 pt-8 text-center">
		{client.id ? (
			<ClientAvatar client={{ id: client.id, name: client.name }} size="lg" />
		) : (
			<span className="flex size-20 items-center justify-center rounded-full bg-muted">
				<UserRound className="size-7 text-muted-foreground" />
			</span>
		)}

		<p className="mt-1 font-semibold break-words">
			{client.name || 'Sin cliente'}
		</p>
		<p className="text-xs tabular-nums text-muted-foreground">
			{client.phone
				? formatClientPhone(client.phone, dialCode)
				: 'Sin teléfono'}
		</p>

		{/*
		 * En una pestaña nueva, y no en ésta.
		 *
		 * La ficha es otra ruta, así que ir en la misma pestaña desmonta el drawer
		 * y se lleva la reserva a medio armar. Que sea otra pestaña además es lo
		 * que hace útil al enlace: se mira el historial de la persona *mientras* se
		 * le arma el turno, que es justamente cuando interesa saber si suele
		 * faltar.
		 */}
		{client.id !== null && (
			<a
				href={clientRoute(client.id)}
				target="_blank"
				rel="noopener noreferrer"
				className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
			>
				Ver ficha
				<ExternalLink className="size-3" aria-hidden="true" />
				<span className="sr-only">(se abre en una pestaña nueva)</span>
			</a>
		)}

		{onClear && (
			<Button variant="ghost" size="sm" className="mt-2" onClick={onClear}>
				Cambiar
			</Button>
		)}
	</div>
);

export default BookingClientPanel;
