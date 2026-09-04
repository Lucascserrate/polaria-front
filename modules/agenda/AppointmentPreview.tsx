'use client';

import { BookOpen, User } from 'lucide-react';
import {
	getAppointmentStatusText,
	STATUS_COLORS,
} from '@/modules/appointments/utils/constants';
import type { Appointment } from '@/types/appointments.types';
import useGetSettings from '@/services/settings/useGetSettings';
import { describeReminder } from './utils/reminderStatus';
import { cn } from '@/lib/utils';

/**
 * El detalle de una cita, con el estado arriba y teñido según cuál sea.
 *
 * El encabezado repite el color que la card ya usa —`STATUS_COLORS`— en vez de
 * elegir uno propio: el estado tiene que verse igual en la agenda, en la lista de
 * citas y acá, y un mapa aparte habría creado una segunda verdad sobre de qué
 * color es "finalizado".
 *
 * Solo se monta cuando la vista previa se abre, y eso es lo que hace aceptable
 * que pida los ajustes del negocio: en una agenda con cuarenta citas, hacerlo en
 * cada card sería una suscripción por card para mostrar un código de moneda.
 */
const AppointmentPreview: React.FC<{
	appointment: Appointment;
	timeRange: string;
}> = ({ appointment, timeRange }) => {
	const { data: settings } = useGetSettings();
	// Sin configuración todavía, el código ISO es el del negocio por defecto.
	const currency = settings?.currency ?? 'BOB';

	const colors = STATUS_COLORS[appointment.status] ?? STATUS_COLORS.confirmed;
	const reminder = describeReminder(appointment.reminder);

	// Lo pactado al reservar, sumando los tramos: es lo que se cobra, no lo que
	// los servicios cuesten hoy.
	const total = (appointment.segments ?? []).reduce(
		(sum, segment) => sum + (segment.price ?? 0),
		0,
	);

	return (
		<>
			<div
				className={cn(
					'flex items-center justify-between gap-3 px-3 py-2 text-xs font-medium',
					colors.badge,
				)}
			>
				<span className="tabular-nums">{timeRange}</span>
				<span>{getAppointmentStatusText(appointment.status)}</span>
			</div>

			<div className="space-y-3 p-3">
				<p className="text-sm font-semibold">{appointment.clientName}</p>

				<div className="space-y-1 text-xs">
					<p className="flex items-center gap-2">
						<User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
						{appointment.staff}
					</p>
					<p className="flex items-center gap-2">
						<BookOpen className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
						{appointment.service}
					</p>
				</div>

				{total > 0 && (
					<p className="flex items-center justify-between border-t border-border pt-2 text-xs">
						<span className="text-muted-foreground">Total</span>
						<span className="font-medium tabular-nums">{`${total} ${currency}`}</span>
					</p>
				)}

				{reminder && (
					<p
						className={cn(
							'border-t border-border pt-2 text-xs',
							reminder.tone === 'warning'
								? 'text-warning'
								: 'text-muted-foreground',
						)}
					>
						{reminder.label}
					</p>
				)}
			</div>
		</>
	);
};

export default AppointmentPreview;
