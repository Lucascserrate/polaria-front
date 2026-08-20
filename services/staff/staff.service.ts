import type { StaffMember } from '@/types/staff.types';
import { axiosInstance } from '@/lib/axios';

/**
 * El equipo completo. El backend carga la relación `services`, que es lo que
 * permite saber qué profesional puede hacer cada servicio.
 */
export const getStaff = async (): Promise<StaffMember[]> => {
	const { data } = await axiosInstance.get('/staff');
	return data;
};

export interface WorkingStaffResponse {
	date: string;
	timezone: string;
	staff: Array<{
		id: string;
		name: string;
		ranges: Array<{ from: string; to: string }>;
	}>;
}

/**
 * Quiénes trabajan hoy según el horario del negocio y la jornada propia de cada
 * profesional. Distinto de `getStaff()`, que devuelve al equipo completo.
 */
export const getWorkingStaff = async (
	date?: string,
): Promise<WorkingStaffResponse> => {
	const { data } = await axiosInstance.get('/availability/working-staff', {
		params: date ? { date } : undefined,
	});
	return data;
};

/** Horarios disponibles para crear una cita a mano desde Agenda. */
export interface BookingSlotApi {
	startTime: string;
	endTime: string;
	/** Profesionales habilitados y libres en ese horario. */
	eligibleStaffIds: string[];
}
