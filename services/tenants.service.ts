import { axiosInstance } from '@/lib/axios';
import type { CreateTenantDto, Tenant, UpdateTenantDto } from '@/types/tenant.types';

const DEFAULT_TIMEZONE =
	(typeof Intl !== 'undefined' &&
		Intl.DateTimeFormat().resolvedOptions().timeZone) ||
		'America/La_Paz';

class TenantsService {
	async getAll(): Promise<Tenant[]> {
		const { data } = await axiosInstance.get('/tenants');
		return data;
	}

	async create(tenantData: CreateTenantDto): Promise<Tenant> {
		const payload = {
			...tenantData,
			timezone: tenantData.timezone || DEFAULT_TIMEZONE,
		};

		const { data } = await axiosInstance.post('/tenants', payload);
		return data;
	}

	async update(id: string, tenantData: UpdateTenantDto): Promise<Tenant> {
		const payload: UpdateTenantDto = {
			...tenantData,
			timezone: tenantData.timezone || DEFAULT_TIMEZONE,
		};

		const { data } = await axiosInstance.patch(`/tenants/${id}`, payload);
		return data;
	}

	async delete(id: string): Promise<void> {
		await axiosInstance.delete(`/tenants/${id}`);
	}
}

export const tenantsService = new TenantsService();
