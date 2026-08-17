import { axiosInstance } from '@/lib/axios';
import type { StaffApi } from '@/types/appointments.types';

export const getStaff = async (): Promise<StaffApi[]> => {
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
