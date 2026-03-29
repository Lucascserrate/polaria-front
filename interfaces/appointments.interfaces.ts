export type AppointmentStatus =
	| 'pending'
	| 'booked'
	| 'confirmed'
	| 'completed'
	| 'cancelled';

export interface Appointment {
	id: string;
	clientName: string;
	time: Date;
	service: string;
	barber: string;
	status: AppointmentStatus;
	duration: number;
}
