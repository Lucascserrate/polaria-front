'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/money';
import type { AppointmentApi } from '@/types/appointments.types';
import {
	getAppointmentStatusText,
	STATUS_COLORS,
} from '@/modules/appointments/utils/constants';
import useGetClientAppointments from '@/services/clients/useGetClientAppointments';

interface Props {
	clientId: string;
	currency: string;
}

/** "agosto de 2026", para encabezar el grupo del mes. */
const monthLabel = (iso: string) =>
	new Intl.DateTimeFormat('es-BO', { month: 'long', year: 'numeric' }).format(
		new Date(iso),
	);

const dayLabel = (iso: string) =>
	new Intl.DateTimeFormat('es-BO', {
		weekday: 'short',
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(iso));

/**
 * El historial de citas del cliente, de la más nueva a la más vieja.
 *
 * Las canceladas se muestran, atenuadas. Esconderlas dejaría al Resumen
 * contando citas que no aparecen en ninguna parte, y además son justo las que
 * el negocio quiere ver antes de darle un turno a alguien que ya faltó dos veces.
 *
 * El precio es `priceAtBooking`: lo pactado cuando se reservó, no lo que ese
 * servicio cuesta hoy. Por eso una cita vieja puede mostrar un precio que ya no
 * existe en la lista de servicios, y está bien que así sea.
 */
const ClientAppointmentsPanel: React.FC<Props> = ({ clientId, currency }) => {
	const [page, setPage] = useState(1);
	const { data, isLoading } = useGetClientAppointments(clientId, page);

	if (isLoading) {
		return (
			<div className="flex justify-center py-12">
				<Spinner className="size-5" />
			</div>
		);
	}

	const items = data?.items ?? [];

	if (items.length === 0) {
		return (
			<div className="rounded-xl border border-border py-12 text-center">
				<p className="text-muted-foreground">
					Todavía no reservó ninguna cita.
				</p>
			</div>
		);
	}

	// Agrupa por mes conservando el orden que ya trae el backend.
	const groups: Array<{ month: string; items: AppointmentApi[] }> = [];
	for (const item of items) {
		const month = monthLabel(item.startTime ?? new Date().toISOString());
		const current = groups.at(-1);
		if (current?.month === month) current.items.push(item);
		else groups.push({ month, items: [item] });
	}

	return (
		<div className="space-y-6">
			<p className="text-sm text-muted-foreground">
				{data?.total} {data?.total === 1 ? 'cita' : 'citas'} en total
			</p>

			{groups.map((group) => (
				<section key={group.month}>
					<h3 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
						{group.month}
					</h3>
					<ul className="space-y-2">
						{group.items.map((appointment) => (
							<AppointmentCard
								key={appointment.id}
								appointment={appointment}
								currency={currency}
							/>
						))}
					</ul>
				</section>
			))}

			{(page > 1 || data?.hasMore) && (
				<div className="flex justify-between gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={page === 1}
						onClick={() => setPage(page - 1)}
					>
						Más recientes
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={!data?.hasMore}
						onClick={() => setPage(page + 1)}
					>
						Más antiguas
					</Button>
				</div>
			)}
		</div>
	);
};

const AppointmentCard: React.FC<{
	appointment: AppointmentApi;
	currency: string;
}> = ({ appointment, currency }) => {
	const colors = STATUS_COLORS[appointment.status] ?? STATUS_COLORS.confirmed;
	const segments = appointment.segments ?? [];
	const total = segments.reduce((sum, segment) => sum + segment.price, 0);

	return (
		<li className={cn('rounded-xl border p-3', colors.surface)}>
			<div className="flex items-start justify-between gap-3">
				<p className="text-sm font-medium">
					{appointment.startTime
						? dayLabel(appointment.startTime)
						: appointment.startTimeFormatted}
				</p>
				<span
					className={cn(
						'shrink-0 rounded-md px-2 py-0.5 text-xs font-medium',
						colors.badge,
					)}
				>
					{getAppointmentStatusText(appointment.status)}
				</span>
			</div>

			<ul className="mt-2 space-y-1">
				{segments.map((segment) => (
					<li
						key={segment.serviceId + segment.startTime}
						className="flex items-baseline justify-between gap-3 text-sm"
					>
						<span className="min-w-0">
							<span className="block truncate">
								{segment.serviceName ?? 'Servicio eliminado'}
							</span>
							<span className="block text-xs text-muted-foreground">
								{segment.durationMinutes} min
								{segment.staffName ? ` · ${segment.staffName}` : ''}
							</span>
						</span>
						<span className="shrink-0 tabular-nums text-muted-foreground">
							{formatMoney(segment.price, currency)}
						</span>
					</li>
				))}
			</ul>

			{segments.length > 1 && (
				<p className="mt-2 border-t border-border pt-2 text-right text-sm font-medium tabular-nums">
					{formatMoney(total, currency)}
				</p>
			)}
		</li>
	);
};

export default ClientAppointmentsPanel;
