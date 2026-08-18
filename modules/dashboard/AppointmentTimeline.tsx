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
}

const AppointmentTimeline = ({
	appointments,
	onMarkAttended,
	onCancel,
	updatingId,
}: Props) => {
	if (appointments.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">No hay citas para hoy</p>
			</div>
		);
	}

	// Arriba lo que viene, abajo lo que ya pasó. El orden cronológico puro dejaba
	// primera la cita de la mañana aunque fueran las 17, y había que recorrer todo
	// el día atendido para ver qué seguía.
	const sorted = sortAgendaByProximity(appointments);

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
