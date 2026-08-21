import { axiosInstance } from '@/lib/axios';
import type {
	CreateStaffDto,
	StaffMember,
	UpdateStaffDto,
	WorkingStaffResponse,
} from '@/types/staff.types';

export const getStaff = async (): Promise<StaffMember[]> => {
	const { data } = await axiosInstance.get('/staff');
	return data;
};

export const getStaffById = async (id: string): Promise<StaffMember> => {
	const { data } = await axiosInstance.get(`/staff/${id}`);
	return data;
};

export const createStaff = async (
	staffData: CreateStaffDto,
): Promise<StaffMember> => {
	const { data } = await axiosInstance.post('/staff', staffData);
	return data;
};

export const updateStaff = async (
	id: string,
	staffData: UpdateStaffDto,
): Promise<StaffMember> => {
	const { data } = await axiosInstance.patch(`/staff/${id}`, staffData);
	return data;
};

export const deleteStaff = async (id: string): Promise<void> => {
	await axiosInstance.delete(`/staff/${id}`);
};

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
