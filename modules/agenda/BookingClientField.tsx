'use client';

import { useMemo, useState } from 'react';
import { Check, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import useGetClients from '@/services/clients/useGetClients';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import type { DraftClient } from './useBookingDraft';

/** Coincidencias que se ofrecen. Más que esto tapa el resto del formulario. */
const MAX_MATCHES = 5;

/** Menos que esto devuelve medio padrón y no ayuda a elegir. */
const MIN_SEARCH_LENGTH = 2;

interface Props {
	client: DraftClient;
	/** Ausente lo deja en lectura, que es lo que corresponde al editar. */
	onChange?: (client: DraftClient) => void;
}

/**
 * De quién es la reserva.
 *
 * Al editar es solo lectura: cambiar de quién es la cita no es editarla, es otra
 * reserva. Al crear se escribe el nombre y, mientras se escribe, se ofrecen los
 * clientes que ya existen.
 *
 * Ese buscador no es un lujo. Sin teléfono, el backend no puede reconocer a
 * alguien por el nombre —la unicidad es `(negocio, teléfono)`—, así que escribir
 * "Ana" dos veces crea dos Anas y su historial queda partido. Elegirla de la
 * lista es lo que evita eso.
 */
const BookingClientField: React.FC<Props> = ({ client, onChange }) => {
	const [touched, setTouched] = useState(false);

	/*
	 * La búsqueda la resuelve el servidor: traer la cartera entera para filtrarla
	 * acá dejaba de funcionar sola a medida que el negocio acumulaba clientes.
	 */
	const term = client.name.trim();
	const debouncedTerm = useDebouncedValue(term);
	const canSearch =
		!!onChange && touched && debouncedTerm.length >= MIN_SEARCH_LENGTH;

	const { data } = useGetClients(
		{ search: debouncedTerm, limit: MAX_MATCHES + 1 },
		{ enabled: canSearch },
	);

	const matches = useMemo(() => {
		if (!canSearch) return [];

		return (data?.items ?? [])
			// Ya elegido: ofrecerlo de nuevo no agrega nada.
			.filter((entry) => entry.id !== client.id)
			.slice(0, MAX_MATCHES);
	}, [data, client.id, canSearch]);

	return (
		<div className="flex items-start gap-3 p-2">
			<span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
				<User className="h-4 w-4 text-muted-foreground" />
			</span>

			<div className="min-w-0 flex-1 space-y-1">
				<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
					Cliente
				</p>

				{onChange ? (
					<>
						<Input
							autoFocus
							placeholder="Nombre del cliente"
							value={client.name}
							onChange={(event) => {
								setTouched(true);
								/*
								 * Escribir suelta al cliente elegido: si se conservara el id, el
								 * nombre visible y la reserva guardada podrían ser dos personas
								 * distintas.
								 */
								onChange({ id: null, name: event.target.value, phone: null });
							}}
						/>

						{matches.length > 0 && (
							<ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
								{matches.map((entry) => (
									<li key={entry.id}>
										<button
											type="button"
											className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-muted/60"
											onClick={() =>
												onChange({
													id: entry.id,
													name: entry.name ?? '',
													phone: entry.phone ?? null,
												})
											}
										>
											<span className="truncate">{entry.name}</span>
											<span className="shrink-0 text-xs text-muted-foreground">
												{entry.phone ?? 'sin teléfono'}
											</span>
										</button>
									</li>
								))}
							</ul>
						)}

						<p className="flex items-center gap-1 text-xs text-muted-foreground">
							{client.id ? (
								<>
									<Check className="h-3 w-3" />
									Cliente existente
								</>
							) : (
								'Se va a crear como cliente nuevo.'
							)}
						</p>
					</>
				) : (
					<>
						<p className="truncate text-sm font-medium">
							{client.name || 'Sin cliente'}
						</p>
						<p className="text-xs text-muted-foreground">
							{client.phone ?? 'Sin teléfono'}
						</p>
					</>
				)}
			</div>
		</div>
	);
};

export default BookingClientField;
