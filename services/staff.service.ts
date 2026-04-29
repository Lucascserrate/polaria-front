import { axiosInstance } from '@/lib/axios';
import type {
	StaffMember,
	CreateStaffDto,
	UpdateStaffDto,
} from '@/types/staff.types';

class StaffService {
	async getAll(): Promise<StaffMember[]> {
		const { data } = await axiosInstance.get('/staff');
		return data;
	}

	async getById(id: string): Promise<StaffMember> {
		const { data } = await axiosInstance.get(`/staff/${id}`);
		return data;
	}

	async create(staffData: CreateStaffDto): Promise<StaffMember> {
		const { data } = await axiosInstance.post('/staff', staffData);
		return data;
	}

	async update(id: string, staffData: UpdateStaffDto): Promise<StaffMember> {
		const { data } = await axiosInstance.patch(`/staff/${id}`, staffData);
		return data;
	}

	async delete(id: string): Promise<void> {
		await axiosInstance.delete(`/staff/${id}`);
	}
}

export const staffService = new StaffService();
export type { StaffMember, CreateStaffDto, UpdateStaffDto };
