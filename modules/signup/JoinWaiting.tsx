'use client';

import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import type { PendingJoinRequest } from '@/services/signup/signup.service';

/**
 * El pedido ya está mandado: ahora depende del negocio.
 *
 * Es el final del camino de quien se une, y lo importante es que diga que
 * **falta alguien más**. Una pantalla que solo dijera "listo" dejaría a la
 * persona refrescando y culpando a Polaria por algo que tiene que resolver su
 * jefe.
 *
 * Se muestra el correo porque sigue siendo el dato que desbloquea todo: si el
 * dueño en lugar de aprobar el pedido lo carga a mano en Equipo, tiene que usar
 * ese mismo correo.
 */
const JoinWaiting: React.FC<{
	requests: PendingJoinRequest[];
	email: string | null;
}> = ({ requests, email }) => (
	<div className="space-y-5">
		<div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 px-4 py-3">
			<Clock className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
			<div className="min-w-0 space-y-1">
				<p className="text-sm font-medium">
					{requests.length === 1
						? `Le pediste acceso a ${requests[0].businessName}.`
						: 'Tus pedidos están esperando respuesta.'}
				</p>
				<p className="text-sm text-muted-foreground">
					Falta que el negocio te acepte. Cuando lo haga, entrás con Google y ya
					estás adentro.
				</p>
			</div>
		</div>

		{requests.length > 1 && (
			<ul className="space-y-1">
				{requests.map((request) => (
					<li key={request.id} className="text-sm text-muted-foreground">
						· {request.businessName}
					</li>
				))}
			</ul>
		)}

		{email && (
			<p className="text-xs text-muted-foreground">
				{`Pediste con ${email}. Si el negocio te carga a mano en Equipo, tiene que usar ese correo.`}
			</p>
		)}

		<Button asChild variant="outline" className="w-full">
			<Link href={ROUTES.auth}>Salir</Link>
		</Button>
	</div>
);

export default JoinWaiting;
