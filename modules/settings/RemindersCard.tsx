'use client';

import { BellRing } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import {
	describeReminderReadiness,
	REMINDER_LEAD_OPTIONS,
} from './utils/reminders';

interface Props {
	enabled: boolean;
	leadMinutes: number;
	onEnabledChange: (enabled: boolean) => void;
	onLeadMinutesChange: (leadMinutes: number) => void;
	disabled?: boolean;
	whatsappConnected: boolean;
	templateStatus?: string;
}

/**
 * Configuración de recordatorios del negocio.
 *
 * Se llama "Recordatorios" y no "Recordatorios de WhatsApp" a propósito: es una
 * capacidad del negocio y el canal es un detalle de entrega. La descripción sí
 * menciona WhatsApp, porque hoy es por dónde llegan y el dueño necesita saberlo.
 */
const RemindersCard: React.FC<Props> = ({
	enabled,
	leadMinutes,
	onEnabledChange,
	onLeadMinutesChange,
	disabled = false,
	whatsappConnected,
	templateStatus,
}) => {
	const readiness = describeReminderReadiness(
		whatsappConnected,
		templateStatus,
	);

	return (
		<Card>
			<CardHeader>
				<div className="flex items-start justify-between gap-4">
					<div className="space-y-1.5">
						<CardTitle className="flex items-center gap-2">
							<BellRing className="h-4 w-4 text-muted-foreground" />
							Recordatorios
						</CardTitle>
						<CardDescription>
							Avisa por WhatsApp a tus clientes antes de su cita, con botones
							para reagendarla o cancelarla.
						</CardDescription>
					</div>

					<Switch
						id="reminders-enabled"
						checked={enabled}
						disabled={disabled}
						onCheckedChange={onEnabledChange}
						aria-label="Activar recordatorios"
					/>
				</div>
			</CardHeader>

			<CardContent className="space-y-3">
				<div>
					<Label htmlFor="reminder-lead">Enviar recordatorio</Label>
					{/*
					 * Con los recordatorios apagados la anticipación no significa nada, así
					 * que se deshabilita en lugar de quedar editable y sin efecto.
					 */}
					<Select
						value={String(leadMinutes)}
						disabled={disabled || !enabled}
						onValueChange={(value) => onLeadMinutesChange(Number(value))}
					>
						<SelectTrigger id="reminder-lead">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{REMINDER_LEAD_OPTIONS.map((option) => (
								<SelectItem key={option.minutes} value={String(option.minutes)}>
									{option.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="mt-2 text-sm text-muted-foreground">
						Una cita agendada con menos anticipación que esta no recibe
						recordatorio.
					</p>
				</div>

				{enabled && readiness && (
					<p className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
						{readiness}
					</p>
				)}
			</CardContent>
		</Card>
	);
};

export default RemindersCard;
