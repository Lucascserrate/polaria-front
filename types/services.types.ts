export interface Service {
	id: string;
	name: string;
	description?: string;
	durationMinutes: number;
	price: number;
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
