import { AppointmentStatus } from '@/types/appointments.types';
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

	// Cronológico: la agenda se recorre hacia adelante durante el día. Antes
	// ordenaba al revés y a media mañana la primera tarjeta era la de la noche.
	const sorted = [...appointments].sort(
		(a, b) => (a.sortKey ?? 0) - (b.sortKey ?? 0),
	);

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
