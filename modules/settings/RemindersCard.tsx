'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { describeReminderReadiness, REMINDER_TOGGLES } from './utils/reminders';

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
	const readiness = describeReminderReadiness(
		whatsappConnected,
		templateStatus,
	);

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
								onCheckedChange={(next) =>
									toggle(option.minutes, next === true)
								}
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
					<div className="rounded-xl bg-neutral-100 p-4 sm:p-5">
						{/*
						 * Se dice arriba y no al pie: quien abre esto está por leer un
						 * mensaje con un nombre y una hora que no existen, y tiene que
						 * saberlo antes de creerlos.
						 */}
						<p className="mb-3 font-mono text-[10px] tracking-[0.12em] text-neutral-500 uppercase">
							Ejemplo · lo que recibe tu cliente
						</p>

						{/*
						 * Una burbuja de chat, no una tarjeta del panel: el texto lo arma el
						 * backend con la plantilla real, y verlo con la forma en que va a
						 * llegar es la mitad de la vista previa. El ancho está acotado porque
						 * un mensaje de WhatsApp nunca ocupa toda la pantalla.
						 */}
						<div className="max-w-88 overflow-hidden rounded-2xl rounded-tl-sm bg-white shadow-sm ring-1 ring-black/5">
							<p className="px-3.5 py-3 text-[13px] leading-relaxed whitespace-pre-line text-neutral-800">
								{previewText}
							</p>

							{previewButtons.length > 0 && (
								<div className="flex divide-x divide-neutral-100 border-t border-neutral-100">
									{previewButtons.map((button) => (
										<span
											key={button}
											className="flex-1 py-2 text-center text-[13px] font-medium text-sky-600"
										>
											{button}
										</span>
									))}
								</div>
							)}
						</div>

						<p className="mt-3 text-xs text-neutral-500">
							El nombre, el servicio, el profesional y la hora salen de cada
							cita. Desde los botones el cliente reagenda o cancela sin escribir
							nada.
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default RemindersCard;
