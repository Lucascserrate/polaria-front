'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
	describeReminderReadiness,
	REMINDER_TOGGLES,
} from './utils/reminders';

interface Props {
	/** Anticipaciones activas, en minutos. */
	offsets: number[];
	onChange: (offsets: number[]) => void;
	previewText: string;
	previewButtons: string[];
	whatsappConnected: boolean;
	templateStatus?: string;
	disabled?: boolean;
}

/**
 * Qué recordatorios recibe el cliente.
 *
 * Dos interruptores independientes en lugar de un selector de horas: el negocio
 * no elige *cuándo* avisar entre varias opciones, elige *qué avisos* quiere. Con
 * un desplegable, tener los dos era imposible de expresar.
 *
 * Ninguno activo es una configuración válida y se dice así, sin tratarla como un
 * campo sin completar.
 */
const RemindersCard: React.FC<Props> = ({
	offsets,
	onChange,
	previewText,
	previewButtons,
	whatsappConnected,
	templateStatus,
	disabled = false,
}) => {
	const [previewOpen, setPreviewOpen] = useState(false);

	const anyActive = offsets.length > 0;
	const readiness = describeReminderReadiness(whatsappConnected, templateStatus);

	const toggle = (minutes: number, next: boolean) => {
		// Se mantiene el orden del más lejano al más cercano, igual que el backend.
		const updated = next
			? [...offsets, minutes]
			: offsets.filter((value) => value !== minutes);

		onChange([...new Set(updated)].sort((a, b) => b - a));
	};

	return (
		<div className="space-y-6">
			<div className="divide-y divide-border overflow-hidden rounded-lg border border-border">
				{REMINDER_TOGGLES.map((option) => {
					const id = `reminder-${option.minutes}`;
					const active = offsets.includes(option.minutes);

					return (
						<div
							key={option.minutes}
							className="flex items-start justify-between gap-4 p-4"
						>
							<div className="space-y-0.5">
								<Label htmlFor={id} className="text-sm font-medium">
									{option.label}
								</Label>
								<p className="text-sm text-muted-foreground">
									{option.description}
								</p>
							</div>
							<Switch
								id={id}
								checked={active}
								disabled={disabled}
								onCheckedChange={(next) => toggle(option.minutes, next === true)}
							/>
						</div>
					);
				})}
			</div>

			{!anyActive && (
				<p className="text-sm text-muted-foreground">
					Los recordatorios están desactivados. Tus clientes no reciben ningún
					aviso antes de su cita.
				</p>
			)}

			{anyActive && readiness && (
				<p className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
					{readiness}
				</p>
			)}

			<div className="space-y-3">
				<button
					type="button"
					onClick={() => setPreviewOpen((open) => !open)}
					className="flex items-center gap-1.5 text-sm font-medium text-foreground"
					aria-expanded={previewOpen}
				>
					{previewOpen ? (
						<ChevronUp className="h-4 w-4" />
					) : (
						<ChevronDown className="h-4 w-4" />
					)}
					Cómo lo verá tu cliente
				</button>

				{previewOpen && (
					<div className="space-y-2">
						{/*
						 * El texto lo arma el backend con la misma plantilla que usa el
						 * envío real, así que esto no puede mostrar algo distinto a lo que
						 * llega. Los nombres y la hora sí son inventados.
						 */}
						<div className="rounded-lg bg-[#dcf8c6] p-3 dark:bg-emerald-950/40">
							<p className="whitespace-pre-line text-sm text-neutral-900 dark:text-neutral-100">
								{previewText}
							</p>

							{previewButtons.length > 0 && (
								<div className="mt-3 space-y-1 border-t border-black/10 pt-2 dark:border-white/10">
									{previewButtons.map((button) => (
										<p
											key={button}
											className="text-center text-sm font-medium text-sky-700 dark:text-sky-400"
										>
											{button}
										</p>
									))}
								</div>
							)}
						</div>

						<p className="text-xs text-muted-foreground">
							Es un ejemplo: el nombre, el servicio, el profesional y la hora
							salen de cada cita.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default RemindersCard;
