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

/**
 * Elimina un profesional.
 *
 * El backend decide si es definitiva o una baja que conserva el historial, y
 * devuelve cuál de las dos hizo. Si tiene citas próximas responde 409 y no
 * elimina nada.
 */
export const deleteStaff = async (
	id: string,
): Promise<{ deleted: true; mode: 'HARD' | 'SOFT' }> => {
	const { data } = await axiosInstance.delete<{
		deleted: true;
		mode: 'HARD' | 'SOFT';
	}>(`/staff/${id}`);
	return data;
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

/**
 * Habilita el acceso de un miembro del equipo con un correo.
 *
 * Responde 409 si el correo ya es de otra cuenta de Polaria —de un negocio o de
 * otra ficha—, que es la información que el panel necesita para explicar por qué
 * no se pudo.
 */
export const grantStaffAccess = async (
	id: string,
	email: string,
): Promise<StaffMember> => {
	const { data } = await axiosInstance.post(`/staff/${id}/access`, { email });
	return data;
};

/** Quita el acceso. La ficha y su historial quedan intactos. */
export const revokeStaffAccess = async (id: string): Promise<StaffMember> => {
	const { data } = await axiosInstance.delete(`/staff/${id}/access`);
	return data;
};
