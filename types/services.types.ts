export interface Service {
	id: string;
	name: string;
	description?: string;
	durationMinutes: number;
	price: number;
	timezone?: string;
	isActive?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

export interface CreateServiceDto {
	name: string;
	description?: string;
	durationMinutes: number;
	price: number;
	timezone: string;
	isActive?: boolean;
}

export type UpdateServiceDto = Partial<CreateServiceDto>;

export type UpdateServiceInput = {
	id: string;
	data: UpdateServiceDto;
};

export type ServiceSummary = Pick<Service, 'id' | 'name' | 'isActive'>;
