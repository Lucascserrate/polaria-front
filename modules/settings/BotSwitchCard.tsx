'use client';

import { Power } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import useGetSettings from '@/services/settings/useGetSettings';
import useUpdateSettings from '@/services/settings/useUpdateSettings';
import { cn } from '@/lib/utils';

/**
 * Interruptor general de Polaria.
 *
 * Guarda al instante y no espera al botón de "Guardar Configuración": es el plan
 * de contingencia del negocio, y un apagado de emergencia que hay que confirmar
 * en otra parte de la pantalla no sirve de plan de contingencia.
 */
const BotSwitchCard: React.FC = () => {
	const { data, isLoading } = useGetSettings();
	const { mutate: save, isPending, variables, isError } = useUpdateSettings();

	const pendingValue = isPending ? variables?.aiEnabled : undefined;
	const enabled = pendingValue ?? data?.aiEnabled ?? true;

	return (
		<Card className={enabled ? undefined : 'border-amber-500/50'}>
			<CardContent className="flex items-start gap-4">
				<Power
					className={cn(
						'w-5 h-5 mt-0.5 shrink-0',
						enabled ? 'text-sky-700' : 'text-amber-600 dark:text-amber-500',
					)}
				/>

				<div className="flex-1 space-y-1">
					<Label htmlFor="bot-enabled" className="text-base">
						Polaria activa
					</Label>
					<p className="text-sm text-muted-foreground">
						{enabled
							? 'Responde los mensajes de WhatsApp y toma reservas.'
							: 'No responde ningún mensaje de WhatsApp. Los mensajes se siguen guardando y podés contestarlos a mano desde WhatsApp.'}
					</p>
					{isError && (
						<p className="text-sm text-red-600">
							No se pudo cambiar el estado. Intenta de nuevo.
						</p>
					)}
				</div>

				<Switch
					id="bot-enabled"
					checked={enabled}
					disabled={isLoading || isPending}
					onCheckedChange={(next) => save({ aiEnabled: next })}
				/>
			</CardContent>
		</Card>
	);
};

export default BotSwitchCard;
