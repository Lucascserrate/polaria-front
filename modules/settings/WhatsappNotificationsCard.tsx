'use client';

import { useState } from 'react';
import {
	CircleCheck,
	CircleDashed,
	ExternalLink,
	TriangleAlert,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import useGetSettings from '@/services/settings/useGetSettings';
import useUpdateSettings from '@/services/settings/useUpdateSettings';
import useRefreshWhatsappBilling from '@/services/settings/useRefreshWhatsappBilling';

/**
 * Notificaciones automáticas por WhatsApp, y lo que hace falta para que salgan.
 *
 * Muestra **tres estados separados** —conectado, facturación, notificaciones— porque
 * son tres cosas distintas que se arreglan en tres lugares distintos, y confundirlas
 * ya nos costó una noche: una WABA conectada, con plantillas aprobadas y número
 * verificado, no entregaba un solo mensaje porque en Meta le faltaba el método de
 * pago.
 *
 * Ese método de pago es un paso que Meta exige a todo cliente de un Tech Provider y
 * que **no se puede hacer desde acá**: no existe un flujo embebido para cargarlo, solo
 * la pantalla de facturación de Meta. Por eso esta pantalla lleva hasta ahí en vez de
 * pedir datos de tarjeta, y por eso el paso aparece antes de activar y no después del
 * primer mensaje que no llegó.
 *
 * De la facturación no se afirma nunca que esté lista: o falta el paso, o Meta rechazó
 * algo, o no lo sabemos. Que un negocio puede enviar lo confirma un envío que no
 * falla, nada más.
 */
const WhatsappNotificationsCard: React.FC = () => {
	const { data } = useGetSettings();
	const { mutate: save, isPending: saving } = useUpdateSettings();
	const { mutate: recheck, isPending: checking } = useRefreshWhatsappBilling();
	const [error, setError] = useState<string | null>(null);

	if (!data) return null;

	const connected = data.whatsappConnection.connected;
	const billing = data.whatsappBilling;
	const enabled = data.notificationsEnabled;

	/*
	 * Dos motivos distintos para frenar, y conviene no mezclarlos en la pantalla.
	 *
	 * `PENDING_SETUP` es un paso que falta, no un error: está pendiente para todos
	 * hasta que alguien lo haga, así que se muestra sin alarma. `ACTION_REQUIRED` es
	 * Meta rechazando algo concreto, y ahí sí va en ámbar y con sus palabras.
	 */
	const setupPending = billing.status === 'PENDING_SETUP';
	const billingRejected = billing.status === 'ACTION_REQUIRED';
	const billingBlocks = setupPending || billingRejected;

	// `UNKNOWN` no bloquea: es nuestra ignorancia y no una objeción de Meta, y trabar
	// a un negocio que funciona por eso sería trabajar en contra suyo.
	const canEnable = connected && !billingBlocks;

	return (
		<section className="space-y-4 rounded-xl border border-border p-5">
			<div>
				<h3 className="font-medium">Notificaciones automáticas por WhatsApp</h3>
				<p className="mt-1 text-sm text-muted-foreground">
					Recibí avisos cuando se creen, reprogramen o cancelen citas, y enviá
					recordatorios automáticos a tus clientes.
				</p>
			</div>

			<ul className="space-y-2 text-sm">
				<StatusRow
					state={connected ? 'ok' : 'off'}
					label="WhatsApp conectado"
					detail={
						connected
							? (data.whatsappConnection.phoneNumber ?? undefined)
							: 'Conectá tu número para empezar.'
					}
				/>
				<StatusRow
					state={billingBlocks ? 'warn' : 'off'}
					label={
						billingRejected
							? 'Meta rechazó un envío por facturación'
							: setupPending
								? 'Falta el método de pago en Meta'
								: 'Facturación en Meta'
					}
					detail={
						billingBlocks
							? undefined
							: 'Meta no reportó problemas. Se confirma al enviar.'
					}
				/>
				<StatusRow
					state={enabled ? 'ok' : 'off'}
					label={
						enabled ? 'Notificaciones activas' : 'Notificaciones desactivadas'
					}
				/>
			</ul>

			{billingBlocks && (
				<div
					className={cn(
						'space-y-3 rounded-lg border p-4',
						billingRejected
							? 'border-amber-500/50 bg-amber-500/10'
							: 'border-border bg-muted/40',
					)}
				>
					<div>
						<p
							className={cn(
								'text-sm font-medium',
								billingRejected && 'text-amber-800 dark:text-amber-400',
							)}
						>
							{billingRejected
								? 'Meta bloqueó los envíos'
								: 'Agregá un método de pago en Meta'}
						</p>
						<p
							className={cn(
								'mt-1 text-sm',
								billingRejected
									? 'text-amber-800/90 dark:text-amber-400/90'
									: 'text-muted-foreground',
							)}
						>
							{billingRejected
								? 'Meta rechazó un envío por un problema de facturación en tu cuenta de WhatsApp Business.'
								: 'Meta cobra los mensajes directamente a tu cuenta de WhatsApp Business, así que necesita una tarjeta cargada antes del primer envío. Se hace una sola vez, en la pantalla de Meta.'}
						</p>
					</div>

					{/* Lo que dijo Meta, con sus palabras: es más preciso que parafrasearlo. */}
					{billing.reason && (
						<p className="rounded border border-amber-500/30 bg-background/50 p-2 text-xs wrap-break-word text-muted-foreground">
							{billing.reason}
						</p>
					)}

					<div className="flex flex-wrap gap-2">
						{billing.setupUrl && (
							<Button asChild size="sm">
								<a
									href={billing.setupUrl}
									target="_blank"
									rel="noopener noreferrer"
								>
									{billingRejected
										? 'Revisar en Meta'
										: 'Agregar método de pago'}
									<ExternalLink className="size-3.5" />
								</a>
							</Button>
						)}

						<Button
							variant="outline"
							size="sm"
							disabled={checking}
							onClick={() => recheck()}
						>
							{checking && <Spinner className="size-3.5" />}
							Ya lo hice
						</Button>
					</div>

					{/*
					 * El enlace abre el Business Manager con la sesión del navegador. Con
					 * otra cuenta —o sin rol en el portafolio— cae en un error de permisos
					 * y no en la pantalla de facturación, y eso se lee como enlace roto.
					 */}
					<p className="text-xs text-muted-foreground">
						Abrilo con la cuenta de Facebook que administra tu negocio en Meta.
					</p>
				</div>
			)}

			<label className="flex items-start justify-between gap-4 border-t border-border pt-4">
				<span>
					<span className="text-sm font-medium">Enviar notificaciones</span>
					<span className="mt-1 block text-xs text-muted-foreground">
						{!connected
							? 'Necesitás conectar WhatsApp primero.'
							: setupPending
								? 'Agregá el método de pago en Meta para poder activarlas.'
								: billingRejected
									? 'Resolvé lo que reporta Meta para poder activarlas.'
									: 'Se envían desde tu propio número de WhatsApp Business.'}
					</span>
				</span>

				<Switch
					checked={enabled}
					disabled={saving || (!enabled && !canEnable)}
					onCheckedChange={(next) => {
						setError(null);
						save(
							{ notificationsEnabled: next },
							{
								onError: () =>
									setError('No se pudo guardar el cambio. Intentá de nuevo.'),
							},
						);
					}}
				/>
			</label>

			{error && <p className="text-sm text-destructive">{error}</p>}
		</section>
	);
};

type RowState = 'ok' | 'warn' | 'off';

const StatusRow: React.FC<{
	state: RowState;
	label: string;
	detail?: string;
}> = ({ state, label, detail }) => (
	<li className="flex items-start gap-2">
		{state === 'ok' ? (
			<CircleCheck className="mt-0.5 size-4 shrink-0 text-emerald-600 dark:text-emerald-500" />
		) : state === 'warn' ? (
			<TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
		) : (
			<CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
		)}

		<span className="min-w-0">
			<span
				className={cn(
					'block',
					state === 'off' && 'text-muted-foreground',
					state === 'warn' && 'text-warning',
				)}
			>
				{label}
			</span>
			{detail && (
				<span className="block text-xs text-muted-foreground">{detail}</span>
			)}
		</span>
	</li>
);

export default WhatsappNotificationsCard;
