'use client';

import { CalendarX2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatLongDate } from '@/lib/date';
import { isAdminRole } from '@/modules/auth/session';
import { useSessionActor } from '@/modules/auth/hooks/useAuth';
import useGetSettings from '@/services/settings/useGetSettings';
import useGetUnresolvedAppointments from '@/services/appointments/useGetUnresolvedAppointments';
import useUpdateAppointmentStatus from '@/services/appointments/useUpdateAppointmentStatus';
import type { Appointment } from '@/types/appointments.types';
import {
	dateKeyInTimeZone,
	formatMinute,
	minutesInTimeZone,
} from './utils/calendarLayout';

/**
 * Cuántas se dibujan. El contador dice el total, que puede ser mucho más.
 *
 * Cuatro y no toda la lista porque el objetivo es que la cola se drene: cuarenta
 * filas no se resuelven, se ignoran. Al cerrar una, entra la siguiente.
 */
const VISIBLE = 4;

/**
 * Las citas de días cerrados que quedaron en pendiente o confirmado.
 *
 * Existe porque el costo de no resolverlas es invisible: los ingresos y las
 * comisiones se calculan **solo** sobre las completadas, así que cada una de
 * estas vale cero para el negocio y cero para quien atendió. El reporte del
 * profesional le dice que trabajó menos de lo que trabajó, y nada en la pantalla
 * explica por qué.
 *
 * Trae las acciones en vez de solo avisar. El dueño casi siempre sabe qué pasó
 * con esas citas; lo que le faltaba era un lugar donde decirlo sin abrir cinco
 * reservas, una por una.
 *
 * No se muestra cuando no hay ninguna: es un aviso, y un recuadro permanente que
 * casi siempre dice "no hay nada" deja de leerse justo cuando importa.
 */
const UnresolvedAppointmentsCard: React.FC = () => {
	/*
	 * Solo para el negocio. Cerrar una cita es cambiarle el estado y eso hoy es
	 * del dueño —el endpoint es `@AdminOnly`—, así que a un profesional esto le
	 * mostraría una lista de tareas que no puede ejecutar. El `enabled` además
	 * evita que su panel pida algo que le va a responder 403.
	 */
	const { actor } = useSessionActor();
	const isAdmin = isAdminRole(actor?.role);

	const { data } = useGetUnresolvedAppointments(VISIBLE, isAdmin);
	const { data: settings } = useGetSettings();
	const {
		mutate: setStatus,
		isPending,
		variables,
	} = useUpdateAppointmentStatus();

	if (!isAdmin || !data?.total) return null;

	// Sin configuración todavía, el código ISO es el del negocio por defecto.
	const currency = settings?.currency ?? 'BOB';

	return (
		<div className="bg-card border border-border rounded-lg shrink-0 overflow-hidden">
			<div className="flex items-center gap-2 px-4 py-3 bg-muted/60">
				<CalendarX2 className="w-4 h-4 text-muted-foreground shrink-0" />
				<span className="text-sm font-medium">Citas sin cerrar</span>
				<span className="ml-auto text-sm font-semibold">{data.total}</span>
			</div>

			{/*
			 * La explicación va una vez arriba y no en cada fila: es el mismo motivo
			 * para todas, y repetirlo cuatro veces convertiría la tarjeta en un texto.
			 */}
			<p className="px-4 py-3 text-xs text-muted-foreground border-b border-border">
				Mientras queden así no cuentan como ingreso ni suman a la comisión de
				quien atendió, y sus reportes muestran menos de lo que trabajaron.
			</p>

			<ul className="divide-y divide-border">
				{data.items.map((appointment) => (
					<UnresolvedRow
						key={appointment.id}
						appointment={appointment}
						timezone={data.timezone}
						currency={currency}
						// La fila que se está resolviendo sale de la mutación, así que no
						// hace falta un estado aparte.
						busy={isPending && variables?.id === appointment.id}
						onResolve={(status) => setStatus({ id: appointment.id, status })}
					/>
				))}
			</ul>
		</div>
	);
};

/**
 * Una cita de la cola, con lo que hace falta para decidir sin abrirla.
 *
 * Lleva la fecha —y no solo la hora, como en la agenda— porque acá las citas son
 * de días distintos: sin ella, cuatro filas con "10:00" no se distinguen.
 */
const UnresolvedRow: React.FC<{
	appointment: Appointment;
	timezone: string;
	currency: string;
	busy: boolean;
	onResolve: (status: 'completed' | 'cancelled') => void;
}> = ({ appointment, timezone, currency, busy, onResolve }) => {
	const total = appointment.segments.reduce(
		(sum, segment) => sum + (segment.price ?? 0),
		0,
	);

	return (
		<li className="px-4 py-3">
			<p className="text-xs text-muted-foreground">
				{describeWhen(appointment, timezone)}
			</p>
			<p className="text-sm font-medium truncate mt-0.5">
				{appointment.clientName}
			</p>
			<p className="text-xs text-muted-foreground truncate mt-0.5">
				{`${appointment.service} · ${appointment.staff}`}
				{total > 0 && ` · ${total} ${currency}`}
			</p>

			<div className="flex items-center gap-1 mt-2">
				<Button
					variant="ghost"
					size="sm"
					className="h-7 px-2 text-xs"
					disabled={busy}
					onClick={() => onResolve('completed')}
				>
					<Check className="w-3 h-3 mr-1" />
					Se atendió
				</Button>

				{/*
				 * "No se presentó" y no "Cancelar": el estado que se guarda es el mismo,
				 * pero en una cita que ya pasó cancelar no libera ningún horario. Lo que
				 * se está diciendo es que no ocurrió, y con esa palabra se entiende.
				 */}
				<Button
					variant="ghost"
					size="sm"
					className="h-7 px-2 text-xs ml-auto text-muted-foreground"
					disabled={busy}
					onClick={() => onResolve('cancelled')}
				>
					<X className="w-3 h-3 mr-1" />
					No se presentó
				</Button>
			</div>
		</li>
	);
};

/**
 * `viernes 28 de agosto · 10:00–11:30`, en la zona del negocio.
 *
 * Se arma con los helpers que ya usa la agenda y no con un formateo nuevo: el
 * instante tiene que leerse en la hora del local y no en la del navegador, y esa
 * cuenta ya está resuelta y probada en `calendarLayout`.
 */
const describeWhen = (appointment: Appointment, timezone: string): string => {
	const zone = appointment.timezone ?? timezone;
	const dateKey = dateKeyInTimeZone(appointment.startTime, zone);
	const startMinute = minutesInTimeZone(appointment.startTime, zone);
	const endMinute = appointment.endTime
		? minutesInTimeZone(appointment.endTime, zone)
		: null;

	// Si el instante no se pudo leer, la etiqueta ya formateada del backend es
	// mejor que una fila sin fecha: peor que una fecha fea es no saber cuál era.
	if (!dateKey || startMinute === null) return appointment.timeLabel;

	const time =
		endMinute === null
			? formatMinute(startMinute)
			: `${formatMinute(startMinute)}–${formatMinute(endMinute)}`;

	return `${formatLongDate(dateKey)} · ${time}`;
};

export default UnresolvedAppointmentsCard;
