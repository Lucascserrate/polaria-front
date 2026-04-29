import type { ServiceSummary } from '@/types/service.types';

export interface StaffMember {
	id: string;
	name: string;
	email?: string;
	isActive: boolean;
	services?: ServiceSummary[];
}

export interface CreateStaffDto {
	name: string;
	email?: string;
	isActive?: boolean;
	calendarId?: string;
	serviceIds?: string[];
}

export interface UpdateStaffDto {
	name?: string;
	email?: string;
	isActive?: boolean;
	calendarId?: string;
	serviceIds?: string[];
}
