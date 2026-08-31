import { axiosInstance } from '@/lib/axios';
import type { ClientApi, ClientPageApi } from '@/types/appointments.types';

export interface ClientsQuery {
	/** Busca en nombre, teléfono y email a la vez. */
	search?: string;
	page?: number;
	limit?: number;
}

/**
 * Una página de clientes, con el buscador resuelto en el servidor.
 *
 * Antes se traían todos y se filtraba en el navegador. Funcionaba con veinte
 * clientes y dejaba de funcionar solo: un negocio con dos años de WhatsApp
 * encima tiene miles, y esa descarga crece en cada reserva.
 */
export const getClients = async (
	query: ClientsQuery = {},
): Promise<ClientPageApi> => {
	const { data } = await axiosInstance.get('/clients', { params: query });
	return data;
};

export const getClient = async (id: string): Promise<ClientApi> => {
	const { data } = await axiosInstance.get(`/clients/${id}`);
	return data;
};

export const findOrCreateClient = async (input: {
	name: string;
	phone?: string;
}): Promise<ClientApi> => {
	const { data } = await axiosInstance.post('/clients/find-or-create', input);
	return data;
};
