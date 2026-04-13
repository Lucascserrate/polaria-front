export type AppointmentStatus =
	| 'booked'
	| 'confirmed'
	| 'completed'
	| 'cancelled';

export interface AppointmentApi {
	id: string;
	startTime: string;
	endTime: string;
	startTimeFormatted?: string;
	endTimeFormatted?: string;
	status: AppointmentStatus;
	clientName?: string;
	staffName?: string;
	businessName?: string;
	serviceNames?: string[];
	totalDuration?: number;
	timezone?: string;
}

export interface AppointmentApiPage {
	items: AppointmentApi[];
	total: number;
	counts: {
		booked: number;
		confirmed: number;
		completed: number;
		cancelled: number;
	};
	page: number;
	limit: number;
	hasMore: boolean;
}

export interface Appointment {
	id: string;
	clientName: string;
	time: Date;
	service: string;
	barber: string;
	status: AppointmentStatus;
	duration: number;
}
