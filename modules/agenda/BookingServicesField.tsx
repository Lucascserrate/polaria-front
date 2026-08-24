'use client';

import { Scissors } from 'lucide-react';
import type { AppointmentSegmentApi } from '@/types/appointments.types';
import type { StaffMember } from '@/types/staff.types';
import BookingServicesEditor, {
	type EditableService,
} from './BookingServicesEditor';
import type { DraftItem } from './utils/bookingDraft';
import { formatMinute, minutesInTimeZone } from './utils/calendarLayout';

interface Props {
	items: DraftItem[];
	onChange: (items: DraftItem[]) => void;
	services: EditableService[];
	staff: StaffMember[];
	offsets: number[];
	/** Inicio de la reserva en ISO, para calcular la hora de cada tramo. */
	startTime: string | null;
	timezone?: string;
	/** Profesional a proponer para el primer servicio, si el click ya lo dijo. */
	preferredStaffId?: string | null;
	/** Con `false` la reserva se muestra como está guardada, sin editar. */
	editable: boolean;
	/** Tramos guardados: es lo que se muestra cuando no se puede editar. */
	segments: AppointmentSegmentApi[];
	/** Avisos ya resueltos por quien conoce el estado del borrador. */
	notices?: React.ReactNode;
	disabled?: boolean;
}

/** La hora de un instante, en la zona del negocio. */
const timeIn = (iso: string, timezone?: string): string => {
	const minute = minutesInTimeZone(iso, timezone);
	return minute === null ? '--:--' : formatMinute(minute);
};

/**
 * Qué servicios tiene la reserva.
 *
 * Cuando se puede editar, delega en el editor; cuando no, muestra los tramos tal
 * como están guardados. Esa segunda forma no es decorativa: una reserva con un
 * tramo sin profesional no se puede replanificar sin inventar datos, y esconderla
 * sería peor que mostrarla sin permitir cambios.
 */
const BookingServicesField: React.FC<Props> = ({
	items,
	onChange,
	services,
	staff,
	offsets,
	startTime,
	timezone,
	preferredStaffId,
	editable,
	segments,
	notices,
	disabled = false,
}) => (
	<div className="space-y-2 px-2">
		<p className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
			<Scissors className="h-3 w-3" />
			Servicios · {items.length}
		</p>

		{editable ? (
			<BookingServicesEditor
				items={items}
				onChange={onChange}
				services={services}
				staff={staff}
				offsets={offsets}
				startMinute={
					startTime ? minutesInTimeZone(startTime, timezone) : null
				}
				preferredStaffId={preferredStaffId}
				disabled={disabled}
			/>
		) : (
			<ul className="space-y-2">
				{segments.map((segment, index) => (
					<li
						key={`${segment.serviceId}-${index}`}
						className="flex items-center gap-3"
					>
						<span className="w-11 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
							{timeIn(segment.startTime, timezone)}
						</span>
						<div className="min-w-0 flex-1 rounded-lg border border-border bg-card p-3">
							<p className="truncate text-sm font-medium">
								{segment.serviceName ?? 'Servicio'}
							</p>
							<p className="truncate text-xs text-muted-foreground">
								{segment.durationMinutes} min ·{' '}
								{segment.staffName ?? 'Sin profesional'}
							</p>
						</div>
					</li>
				))}
			</ul>
		)}

		{notices}
	</div>
);

export default BookingServicesField;
