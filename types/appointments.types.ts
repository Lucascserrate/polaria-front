export type AppointmentStatus =
	| 'pending'
	| 'booked'
	| 'confirmed'
	| 'completed'
	| 'cancelled';

export interface AppointmentApi {
	id: string;
	startTime?: string;
	endTime?: string;
	startTimeFormatted: string;
	endTimeFormatted: string;
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
		pending: number;
		booked: number;
		confirmed: number;
		completed: number;
		cancelled: number;
	};
	page: number;
	limit: number;
	hasMore: boolean;
}

export interface AppointmentApiToday {
	items: AppointmentApi[];
	total: number;
	counts: {
		pending: number;
		booked: number;
		confirmed: number;
		completed: number;
		cancelled: number;
	};
	revenueTotal: number;
}

export interface Appointment {
	id: string;
	clientName: string;
	timeLabel: string;
	sortKey: number;
	service: string;
	barber: string;
	status: AppointmentStatus;
	duration: number;
}

export interface ServiceApi {
	id: string;
	name: string;
	description?: string;
	price: number;
	timezone: string;
	durationMinutes: number;
	isActive: boolean;
}

export interface StaffApi {
	id: string;
	name: string;
	email: string;
	calendarId?: string;
	isActive: boolean;
}

export interface ClientApi {
	id: string;
	name?: string;
	phone: string;
	notes?: string;
}
