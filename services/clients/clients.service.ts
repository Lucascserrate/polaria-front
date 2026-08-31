import { axiosInstance } from '@/lib/axios';
import type {
	ClientApi,
	ClientAppointmentsPageApi,
	ClientPageApi,
	ClientSummaryApi,
} from '@/types/appointments.types';

export interface ClientsQuery {
	/** Busca en nombre, teléfono y email a la vez. */
	search?: string;
	page?: number;
	limit?: number;
}

export interface ClientPayload {
	name?: string;
	phone?: string;
	email?: string;
	/** `'YYYY-MM-DD'`. */
	birthDate?: string;
	notes?: string;
}

/** Qué hizo el backend al eliminar: ver `resolveClientDeletion`. */
export interface ClientDeletionResult {
	deleted: true;
	mode: 'HARD' | 'SOFT';
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

/**
 * Da de alta un cliente. Si el teléfono ya es de otro, devuelve **ése**.
 *
 * Es deliberado del backend y conviene saberlo acá: para quien está cargando la
 * ficha, "ya existe" y "acá está" son la misma respuesta útil, así que la
 * pantalla lo trata como un alta correcta y abre el que corresponde.
 */
export const createClient = async (
	payload: ClientPayload,
): Promise<ClientApi> => {
	const { data } = await axiosInstance.post('/clients', payload);
	return data;
};

export const updateClient = async (
	id: string,
	payload: ClientPayload,
): Promise<ClientApi> => {
	const { data } = await axiosInstance.patch(`/clients/${id}`, payload);
	return data;
};

export const deleteClient = async (
	id: string,
): Promise<ClientDeletionResult> => {
	const { data } = await axiosInstance.delete(`/clients/${id}`);
	return data;
};

export const getClientSummary = async (
	id: string,
): Promise<ClientSummaryApi> => {
	const { data } = await axiosInstance.get(`/clients/${id}/summary`);
	return data;
};

export const getClientAppointments = async (
	id: string,
	query: { page?: number; limit?: number } = {},
): Promise<ClientAppointmentsPageApi> => {
	const { data } = await axiosInstance.get(`/clients/${id}/appointments`, {
		params: query,
	});
	return data;
};

export const findOrCreateClient = async (input: {
	name: string;
	phone?: string;
}): Promise<ClientApi> => {
	const { data } = await axiosInstance.post('/clients/find-or-create', input);
	return data;
};
