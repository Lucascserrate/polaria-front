'use client';

import Link from 'next/link';
import { Check, Link2, MessageSquare } from 'lucide-react';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import useGetSettings from '@/services/settings/useGetSettings';
import useUpdateSettings from '@/services/settings/useUpdateSettings';
import type { SettingsResponse } from '@/services/settings/settings.service';

type Mode = SettingsResponse['bookingMode'];

const OPTIONS: Array<{
	value: Mode;
	icon: typeof MessageSquare;
	title: string;
	description: string;
}> = [
	{
		value: 'GUIDED_CHAT',
		icon: MessageSquare,
		title: 'Directamente por WhatsApp',
		description:
			'Polaria le pregunta el servicio, con quién y a qué hora, y reserva sin salir del chat. Toma un servicio por turno.',
	},
	{
		value: 'BOOKING_LINK',
		icon: Link2,
		title: 'Desde tu página de reservas',
		description:
			'Polaria le manda el enlace. Puede elegir varios servicios de una vez, y también ver y cambiar sus turnos desde ahí.',
	},
];

/**
 * Cómo agendan los clientes que escriben por WhatsApp.
 *
 * Vive en Configuración › WhatsApp porque es una regla de **comportamiento del
 * asistente**: lo que cambia es qué pasa cuando alguien toca "Agendar cita". En
 * Mi página iría el enlace, no la decisión de usarlo.
 *
 * **Guarda al tocar, sin botón.** Es un interruptor entre dos opciones que se
 * leen enteras antes de elegir, así que un "Guardar" abajo sólo agregaría un
 * paso para confirmar algo que ya se decidió. El aviso de guardado aparece en
 * la opción elegida.
 *
 * Lo que apaga la segunda opción no es una preferencia sino un hecho: sin
 * página no hay enlace. Se dice con el camino para resolverlo —el enlace se
 * crea al guardar el nombre del negocio— en lugar de un control gris sin
 * explicación.
 */
const BookingModeCard: React.FC = () => {
	const { data: settings, isLoading } = useGetSettings();
	const { mutate: save, isPending, isSuccess, isError } = useUpdateSettings();

	if (isLoading) {
		return (
			<div className="h-56 animate-pulse rounded-xl border border-border bg-muted/50" />
		);
	}

	const current = settings?.bookingMode ?? 'GUIDED_CHAT';
	const hasPage = Boolean(settings?.publicBookingUrl);

	return (
		<div className="space-y-4 rounded-xl border border-border p-4 sm:p-6">
			<div className="space-y-1">
				<h2 className="text-lg font-semibold">
					¿Cómo querés que tus clientes agenden?
				</h2>
				<p className="text-sm text-muted-foreground">
					Vale para quien te escribe por WhatsApp. En los dos casos Polaria
					sigue saludando, respondiendo y avisándote.
				</p>
			</div>

			<div className="space-y-3">
				{OPTIONS.map((option) => {
					const active = option.value === current;
					const blocked = option.value === 'BOOKING_LINK' && !hasPage;
					const Icon = option.icon;

					return (
						<button
							key={option.value}
							type="button"
							aria-pressed={active}
							disabled={blocked || isPending}
							onClick={() => {
								if (active) return;
								save({ bookingMode: option.value });
							}}
							className={cn(
								'flex w-full gap-3 rounded-lg border p-4 text-left transition-colors',
								active
									? 'border-foreground bg-accent'
									: 'border-border hover:bg-accent/50',
								blocked && 'cursor-not-allowed opacity-50 hover:bg-transparent',
							)}
						>
							<Icon className="mt-0.5 h-5 w-5 shrink-0" />

							<span className="min-w-0 flex-1">
								<span className="flex items-center gap-2 font-medium">
									{option.title}
									{active && isSuccess && (
										<Check className="h-4 w-4 text-muted-foreground" />
									)}
								</span>
								<span className="mt-1 block text-sm text-muted-foreground">
									{option.description}
								</span>
							</span>
						</button>
					);
				})}
			</div>

			{!hasPage && (
				<p className="text-sm text-muted-foreground">
					Para mandar el enlace, tu negocio necesita página.{' '}
					<Link
						href={ROUTES.settingsBusiness}
						className="font-medium text-foreground underline underline-offset-4"
					>
						Guardá el nombre del negocio
					</Link>{' '}
					y el enlace se crea solo.
				</p>
			)}

			{isError && (
				<p className="text-sm text-destructive">
					No se pudo guardar. Intentá de nuevo.
				</p>
			)}
		</div>
	);
};

export default BookingModeCard;
