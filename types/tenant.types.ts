export type TenantStatus = 'active' | 'inactive';

export interface Tenant {
	id: string;
	name: string;
	businessType?: string;
	whatsappPhoneNumber: string;
	whatsappPhoneId: string;
	whatsappAccessToken?: string;
	timezone: string;
	email?: string;
	googleId?: string;
	status?: TenantStatus;
	aiEnabled: boolean;
	googleRefreshToken?: string;
	googleAccessToken?: string;
	calendarId?: string;
	createdAt: string;
	updatedAt: string;
}

export interface CreateTenantDto {
	name: string;
	businessType: string;
	email?: string;
	whatsappPhoneNumber: string;
	whatsappPhoneId: string;
	whatsappAccessToken: string;
	timezone: string;
	status?: TenantStatus;
	aiEnabled?: boolean;
}

export type UpdateTenantDto = Partial<CreateTenantDto>;
