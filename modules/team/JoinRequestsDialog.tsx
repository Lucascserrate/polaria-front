'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
	usePendingJoinRequests,
	useResolveJoinRequest,
} from '@/services/staff/useJoinRequests';

/**
 * Las solicitudes de acceso, abiertas a pedido desde el menú de Equipo.
 *
 * Convive con la tarjeta y no la reemplaza, y las dos hacen falta por motivos
 * distintos. La tarjeta es el aviso: aparece sola cuando alguien está esperando,
 * que es cuando hay que actuar. Esto es la puerta: existe siempre, así que
 * cuando un empleado avisa por WhatsApp "ya te mandé la solicitud", el dueño
 * tiene dónde ir a mirar en lugar de buscar una tarjeta que no está.
 *
 * Que la puerta faltara no fue una hipótesis: el dueño de Polaria buscó la
 * tarjeta, no la encontró —había además un choque de rutas— y no tenía ningún
 * otro lugar donde confirmar si existían pedidos o no.
 */
const JoinRequestsDialog: React.FC<{
	open: boolean;
	onOpenChange: (open: boolean) => void;
}> = ({ open, onOpenChange }) => {
	const { data: requests = [], isLoading } = usePendingJoinRequests();
	const { mutate: resolve, isPending, variables } = useResolveJoinRequest();
	const [error, setError] = useState<string | null>(null);

	const handle = (id: string, approve: boolean) => {
		setError(null);
		resolve(
			{ id, approve },
			{
				onError: () =>
					setError('No se pudo resolver la solicitud. Probá de nuevo.'),
			},
		);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Solicitudes de acceso</DialogTitle>
					<DialogDescription>
						Gente que pidió entrar al panel de tu negocio. Al aceptar, entra con
						ese correo y queda en tu equipo.
					</DialogDescription>
				</DialogHeader>

				{error && (
					<p role="alert" className="text-sm text-destructive">
						{error}
					</p>
				)}

				{isLoading ? (
					<div className="h-16 animate-pulse rounded-lg bg-muted" />
				) : requests.length === 0 ? (
					/*
					 * El vacío dice qué esperar, no "no hay nada".
					 *
					 * Es la pantalla que el dueño va a ver casi siempre, y es donde se
					 * entera de que esto existe: sin explicar de dónde sale una solicitud,
					 * abrir el menú y encontrar un cero no le enseña nada.
					 */
					<div className="space-y-1 py-2">
						<p className="text-sm font-medium">No hay solicitudes.</p>
						<p className="text-sm text-muted-foreground">
							Cuando alguien de tu equipo entre a Polaria con Google y busque tu
							negocio, su pedido aparece acá.
						</p>
					</div>
				) : (
					<ul className="space-y-2">
						{requests.map((request) => {
							const busy = isPending && variables?.id === request.id;

							return (
								<li
									key={request.id}
									className="flex flex-wrap items-center gap-2 rounded-lg border border-border px-3 py-2"
								>
									<div className="min-w-0 flex-1">
										{request.name && (
											<p className="truncate text-sm font-medium">
												{request.name}
											</p>
										)}
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
				)}
			</DialogContent>
		</Dialog>
	);
};

export default JoinRequestsDialog;
