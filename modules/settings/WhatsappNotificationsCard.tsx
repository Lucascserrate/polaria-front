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
 * verificado, no entregaba un solo mensaje porque en Meta le faltaba la moneda.
 *
 * De la facturación solo se afirman dos cosas, que son las dos que sabemos: **Meta
 * reportó un problema**, o **no lo sabemos**. No hay un verde de "facturación lista":
 * lo hubo, apoyado en una consulta que solo lee la moneda configurada, y prometía
 * algo que nunca comprobamos. Que un negocio puede enviar lo confirma un envío que no
 * falla, nada más.
 *
 * Meta le cobra directamente al negocio. Polaria no cobra por mensaje ni lleva saldo,
 * y esta pantalla no pide datos de pago: lleva al flujo de Meta, que es donde eso se
 * hace.
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

	const billingBlocks = billing.status === 'ACTION_REQUIRED';

	/*
	 * Solo bloquea cuando Meta lo dijo.
	 *
	 * El otro estado es "no sabemos", y trabar a un negocio que funciona por algo que
	 * no comprobamos sería peor que no comprobar nada.
	 */
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
						billingBlocks ? 'Facturación pendiente' : 'Facturación en Meta'
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
				<div className="space-y-3 rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
					<div>
						<p className="text-sm font-medium text-amber-800 dark:text-amber-400">
							Configuración de facturación requerida
						</p>
						<p className="mt-1 text-sm text-amber-800/90 dark:text-amber-400/90">
							Meta rechazó un envío por un problema de facturación en tu cuenta
							de WhatsApp Business. Los cargos de WhatsApp los realiza Meta
							directamente a tu cuenta.
						</p>
					</div>

					{/* Lo que dijo Meta, con sus palabras: es más preciso que parafrasearlo. */}
					{billing.reason && (
						<p className="rounded border border-amber-500/30 bg-background/50 p-2 text-xs break-words text-muted-foreground">
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
									Configurar en Meta
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
							Ya lo configuré
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
							: billingBlocks
								? 'Resolvé la facturación en Meta para poder activarlas.'
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

			{error && <p className="text-sm text-red-600">{error}</p>}
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
			<TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-500" />
		) : (
			<CircleDashed className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
		)}

		<span className="min-w-0">
			<span
				className={cn(
					'block',
					state === 'off' && 'text-muted-foreground',
					state === 'warn' && 'text-amber-700 dark:text-amber-500',
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
