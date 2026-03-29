import { AppointmentStatus } from '@/types/appointments.types';
import { AppointmentCard } from './AppointmentCard';

interface Appointment {
	id: string;
	clientName: string;
	time: Date;
	service: string;
	barber: string;
	status: AppointmentStatus;
	duration: number;
}

interface Props {
	appointments: Appointment[];
}

const AppointmentTimeline = ({ appointments }: Props) => {
	if (appointments.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">
					No appointments scheduled for today
				</p>
			</div>
		);
	}

	// Sort by time
	const sorted = [...appointments].sort(
		(a, b) => a.time.getTime() - b.time.getTime(),
	);

	return (
		<div className="space-y-3">
			{sorted.map((appointment) => (
				<AppointmentCard
					key={appointment.id}
					id={appointment.id}
					time={appointment.time}
					clientName={appointment.clientName}
					service={appointment.service}
					barber={appointment.barber}
					status={appointment.status}
					duration={appointment.duration}
				/>
			))}
		</div>
	);
};

export default AppointmentTimeline;
