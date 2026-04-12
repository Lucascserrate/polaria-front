import { axiosInstance } from '@/lib/axios';
import type { StaffMember, CreateStaffDto, UpdateStaffDto } from '@/types/staff.types';

class StaffService {
	async getAll(): Promise<StaffMember[]> {
		const response = await axiosInstance.get('/staff');
		return response.data;
	}

	async getById(id: string): Promise<StaffMember> {
		const response = await axiosInstance.get(`/staff/${id}`);
		return response.data;
	}

	async create(staffData: CreateStaffDto): Promise<StaffMember> {
		const response = await axiosInstance.post('/staff', staffData);
		return response.data;
	}

	async update(id: string, staffData: UpdateStaffDto): Promise<StaffMember> {
		const response = await axiosInstance.patch(`/staff/${id}`, staffData);
		const staff = response.data;
		return { ...staff, active: staff.isActive };
	}

	async delete(id: string): Promise<void> {
		await axiosInstance.delete(`/staff/${id}`);
	}
}

export const staffService = new StaffService();
export type { StaffMember, CreateStaffDto, UpdateStaffDto };
