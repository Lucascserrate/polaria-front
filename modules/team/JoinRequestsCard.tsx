'use client';

import { useState } from 'react';
import { Check, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
	usePendingJoinRequests,
	useResolveJoinRequest,
} from '@/services/staff/useJoinRequests';

/**
 * Quién pidió entrar al negocio y todavía no tuvo respuesta.
 *
 * Arriba del equipo y no al final: es lo único de esta pantalla que otra persona
 * está esperando. Un pedido sin resolver deja a alguien afuera de su propio
 * trabajo, y si estuviera abajo de una tabla de quince filas nadie lo vería.
 *
 * Desaparece cuando no hay nada. Una tarjeta permanente que casi siempre dice
 * "no hay pedidos" es una tarjeta que se deja de leer, y justo el día que diga
 * algo tampoco se va a leer.
 */
const JoinRequestsCard: React.FC = () => {
	const { data: requests = [] } = usePendingJoinRequests();
	const { mutate: resolve, isPending, variables } = useResolveJoinRequest();
	const [error, setError] = useState<string | null>(null);

	if (requests.length === 0) return null;

	const handle = (id: string, approve: boolean) => {
		setError(null);
		resolve(
			{ id, approve },
			{
				onError: () =>
					setError('No se pudo resolver el pedido. Probá de nuevo.'),
			},
		);
	};

	return (
		<section className="space-y-3 rounded-xl border border-amber-500/50 bg-amber-500/5 p-4">
			<div className="flex items-start gap-2">
				<UserPlus className="mt-0.5 size-4 shrink-0 text-warning" />
				<div className="space-y-0.5">
					<h2 className="text-sm font-semibold">
						{requests.length === 1
							? 'Alguien pidió acceso a tu negocio'
							: `${requests.length} personas pidieron acceso a tu negocio`}
					</h2>
					<p className="text-xs text-muted-foreground">
						Al aceptar, entra al panel con ese correo y queda en tu equipo. Sin
						atender clientes hasta que vos lo configures.
					</p>
				</div>
			</div>

			{error && (
				<p role="alert" className="text-xs text-destructive">
					{error}
				</p>
			)}

			<ul className="space-y-2">
				{requests.map((request) => {
					const busy = isPending && variables?.id === request.id;

					return (
						<li
							key={request.id}
							className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-background px-3 py-2"
						>
							<div className="min-w-0 flex-1">
								{request.name && (
									<p className="truncate text-sm font-medium">{request.name}</p>
								)}
								{/*
								 * El correo siempre, y en mono: es con lo que va a entrar, y es
								 * el dato con el que el dueño reconoce —o no— a la persona.
								 * Confundirlo fue la causa del incidente que trajo todo esto.
								 */}
								<p className="truncate font-mono text-xs text-muted-foreground">
									{request.email}
								</p>
							</div>

							<div className="flex shrink-0 items-center gap-1">
								<Button
									variant="ghost"
									size="sm"
									disabled={busy}
									onClick={() => handle(request.id, false)}
								>
									<X className="size-3.5" />
									Rechazar
								</Button>

								<Button
									size="sm"
									disabled={busy}
									onClick={() => handle(request.id, true)}
								>
									{busy ? (
										<Spinner className="size-3.5" />
									) : (
										<Check className="size-3.5" />
									)}
									Aceptar
								</Button>
							</div>
						</li>
					);
				})}
			</ul>
		</section>
	);
};

export default JoinRequestsCard;
