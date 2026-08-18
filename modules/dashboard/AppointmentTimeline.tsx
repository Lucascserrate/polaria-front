import { AppointmentStatus } from '@/types/appointments.types';
import { sortAgendaByProximity } from '@/modules/appointments/utils/sortAgenda';
import { AppointmentCard } from './AppointmentCard';

interface Appointment {
	id: string;
	clientName: string;
	timeLabel: string;
	sortKey: number;
	service: string;
	barber: string;
	status: AppointmentStatus;
	duration: number;
}

interface Props {
	appointments: Appointment[];
	onMarkAttended: (id: string) => void;
	onCancel: (id: string) => void;
	updatingId?: string | null;
	/**
	 * Ordena por cercanía al ahora en vez de cronológicamente. Solo tiene sentido
	 * para el día en curso: en otra fecha no hay un "ahora" adentro del día
	 * contra el cual medir, y el orden natural es el del reloj.
	 */
	sortByProximity?: boolean;
	emptyMessage?: string;
}

const AppointmentTimeline = ({
	appointments,
	onMarkAttended,
	onCancel,
	updatingId,
	sortByProximity = true,
	emptyMessage = 'No hay citas para este día',
}: Props) => {
	if (appointments.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">{emptyMessage}</p>
			</div>
		);
	}

	// Arriba lo que viene, abajo lo que ya pasó. El orden cronológico puro dejaba
	// primera la cita de la mañana aunque fueran las 17, y había que recorrer todo
	// el día atendido para ver qué seguía.
	const sorted = sortByProximity
		? sortAgendaByProximity(appointments)
		: [...appointments].sort((a, b) => a.sortKey - b.sortKey);

	return (
		<div className="space-y-3">
			{sorted.map((appointment) => (
				<AppointmentCard
					key={appointment.id}
					id={appointment.id}
					timeLabel={appointment.timeLabel}
					clientName={appointment.clientName}
					service={appointment.service}
					barber={appointment.barber}
					status={appointment.status}
					duration={appointment.duration}
					onMarkAttended={onMarkAttended}
					onCancel={onCancel}
					isUpdating={updatingId === appointment.id}
				/>
			))}
		</div>
	);
};

export default AppointmentTimeline;
