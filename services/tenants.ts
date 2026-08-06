import { axiosInstance } from '@/lib/axios';
import {
	DEFAULT_TENANT_AI_ENABLED,
	DEFAULT_TENANT_STATUS,
} from '@/modules/tenants/utils/tenantDefaults';
import { normalizeTenantPayload } from '@/modules/tenants/utils/tenantPayload';
import { DEFAULT_TIMEZONE } from '@/modules/tenants/utils/timezoneUtils';
import type {
	CreateTenantDto,
	Tenant,
	UpdateTenantDto,
} from '@/types/tenant.types';

export const getTenants = async (): Promise<Tenant[]> => {
	const { data } = await axiosInstance.get<Tenant[]>('/tenants');
	return data;
};

export const createTenant = async (tenantData: CreateTenantDto) => {
	const payload: CreateTenantDto = {
		...tenantData,
		timezone: tenantData.timezone || DEFAULT_TIMEZONE,
	};
	const { data } = await axiosInstance.post<Tenant>('/tenants', {
		...normalizeTenantPayload(payload),
		status: DEFAULT_TENANT_STATUS,
		aiEnabled: DEFAULT_TENANT_AI_ENABLED,
	});
	return data;
};

export const updateTenant = async ({
	id,
	body,
}: {
	id: string;
	body: UpdateTenantDto;
}) => {
	const payload = normalizeTenantPayload(body);
	const { data } = await axiosInstance.patch<Tenant>(`/tenants/${id}`, payload);
	return data;
};

export const deleteTenant = async (id: string) => {
	await axiosInstance.delete(`/tenants/${id}`);
	return id;
};
