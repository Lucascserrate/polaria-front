import { axiosInstance } from '@/lib/axios';
import type {
	CreateTenantDto,
	Tenant,
	UpdateTenantDto,
} from '@/types/tenant.types';

const DEFAULT_TIMEZONE =
	(typeof Intl !== 'undefined' &&
		Intl.DateTimeFormat().resolvedOptions().timeZone) ||
	'America/La_Paz';

class TenantsService {
	async getAll(): Promise<Tenant[]> {
		const { data } = await axiosInstance.get('/tenants');
		return data;
	}

	async getById(id: string): Promise<Tenant> {
		const { data } = await axiosInstance.get(`/tenants/${id}`);
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

	/**
	 * Manda solo lo que el editor cambió.
	 *
	 * La zona horaria no se rellena con la del navegador como en el alta: acá el
	 * negocio ya tiene la suya, y completar un campo vacío con la de quien está
	 * mirando la pantalla desde otro país le movería la agenda entera.
	 */
	async update(id: string, tenantData: UpdateTenantDto): Promise<Tenant> {
		const { data } = await axiosInstance.patch(`/tenants/${id}`, tenantData);
		return data;
	}

	async delete(id: string): Promise<void> {
		await axiosInstance.delete(`/tenants/${id}`);
	}
}

export const tenantsService = new TenantsService();
