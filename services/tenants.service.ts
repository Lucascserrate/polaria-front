import { axiosInstance } from '@/lib/axios';
import type { EmbeddedSignupResult } from '@/modules/settings/WhatsappEmbeddedSignupButton';
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

	/**
	 * Guarda en este negocio lo que devolvió el Embedded Signup.
	 *
	 * Ruta propia de soporte y no la de `/settings`: aquélla saca el tenant del
	 * JWT, así que correrla desde acá guardaría las credenciales en el negocio de
	 * quien está dando soporte. Acá el tenant va en la URL.
	 */
	async completeWhatsappSignup(
		tenantId: string,
		result: EmbeddedSignupResult,
	): Promise<void> {
		await axiosInstance.patch(
			`/support/tenants/${tenantId}/whatsapp/embedded-signup`,
			result,
		);
	}

	async disconnectWhatsapp(tenantId: string): Promise<void> {
		await axiosInstance.post(
			`/support/tenants/${tenantId}/whatsapp/disconnect`,
		);
	}

	/**
	 * Abre una sesión de soporte dentro del negocio.
	 *
	 * No devuelve nada que haya que guardar: lo que hace es dejar una cookie que
	 * el navegador va a mandar sola en todo lo que venga después. La sesión propia
	 * del super admin queda intacta, así que salir no pasa por Google de nuevo.
	 */
	async impersonate(tenantId: string): Promise<void> {
		await axiosInstance.post(`/support/tenants/${tenantId}/impersonate`);
	}
}

export const tenantsService = new TenantsService();
