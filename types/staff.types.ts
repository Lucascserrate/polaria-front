export interface StaffMember {
	id: string;
	name: string;
	email: string;
	isActive: boolean;
}

export interface CreateStaffDto {
	name: string;
	email: string;
	isActive?: boolean;
	calendarId?: string;
}

export interface UpdateStaffDto {
	name?: string;
	isActive?: boolean;
}
