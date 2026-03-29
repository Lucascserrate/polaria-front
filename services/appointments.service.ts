import type { Appointment } from '@/interfaces/appointments.interfaces';
import type { AppointmentApi } from '@/mappers/appointments.mapper';
import { toAppointment } from '@/mappers/appointments.mapper';
import { apiFetch } from '@/services/api';

export async function getTodayAppointments(): Promise<Appointment[]> {
	const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
	const path = tenantId
		? `/appointments/today?tenantId=${encodeURIComponent(tenantId)}`
		: '/appointments/today';
	const data = await apiFetch<AppointmentApi[]>(path);
	return data.map(toAppointment);
}

