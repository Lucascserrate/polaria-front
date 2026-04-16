export interface Service {
	id: string;
	name: string;
	description?: string;
	price: number;
	timezone: string;
	durationMinutes: number;
	isActive: boolean;
}

export type ServiceSummary = Pick<Service, 'id' | 'name' | 'isActive'>;

