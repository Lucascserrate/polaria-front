import type { Appointment } from '@/interfaces/appointments.interfaces';

export type AppointmentApi = {
	id: string;
	tenantId: string;
	staffId: string;
	clientId: string;
	serviceId: string;
	startTime: string;
	endTime: string;
	status: string;
	client?: { name?: string | null };
	staff?: { name?: string | null };
	service?: { name?: string | null };
};

export function toAppointment(apt: AppointmentApi): Appointment {
	const start = new Date(apt.startTime);
	const end = new Date(apt.endTime);
	const duration =
		Number.isFinite(start.getTime()) && Number.isFinite(end.getTime())
			? Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000))
			: 0;

	return {
		id: apt.id,
		clientName: apt.client?.name || apt.clientId,
		time: start,
		service: apt.service?.name || apt.serviceId,
		barber: apt.staff?.name || apt.staffId,
		status: apt.status as Appointment['status'],
		duration,
	};
}
