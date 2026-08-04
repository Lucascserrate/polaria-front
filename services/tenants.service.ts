import { axiosInstance } from '@/lib/axios';
import type {
	CreateTenantDto,
	Tenant,
	UpdateTenantDto,
} from '@/types/tenant.types';
import { normalizeTenantPayload } from '@/modules/tenants/utils/tenantPayload';
import { DEFAULT_TIMEZONE } from '@/modules/tenants/utils/timezoneUtils';

class TenantsService {
	async getAll(): Promise<Tenant[]> {
		const { data } = await axiosInstance.get('/tenants');
		return data;
	}

	async create(tenantData: CreateTenantDto): Promise<Tenant> {
		const payload: CreateTenantDto = {
			...tenantData,
			timezone: tenantData.timezone || DEFAULT_TIMEZONE,
		};

		const { data } = await axiosInstance.post('/tenants', payload);
		return data;
	}

	async update(id: string, tenantData: UpdateTenantDto): Promise<Tenant> {
		const payload = normalizeTenantPayload(tenantData);

		const { data } = await axiosInstance.patch(`/tenants/${id}`, payload);
		return data;
	}

	async delete(id: string): Promise<void> {
		await axiosInstance.delete(`/tenants/${id}`);
	}
}

export const tenantsService = new TenantsService();
