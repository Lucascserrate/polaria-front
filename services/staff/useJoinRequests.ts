import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { staffKeys } from './staffKeys';

/** Un pedido de acceso tal como lo ve el negocio que tiene que resolverlo. */
export interface JoinRequest {
	id: string;
	email: string;
	name: string | null;
	createdAt: string;
}

export const joinRequestKeys = {
	pending: ['staff', 'join-requests'] as const,
};

/**
 * Los pedidos de acceso sin resolver.
 *
 * Se piden aparte del equipo y no dentro de él: son otra cosa —gente que
 * **todavía no** forma parte— y mezclarlos en la misma respuesta haría que la
 * lista del equipo dejara de significar quiénes trabajan acá.
 */
export const usePendingJoinRequests = () =>
	useQuery({
		queryKey: joinRequestKeys.pending,
		queryFn: async () => {
			const { data } =
				await axiosInstance.get<JoinRequest[]>('/join-requests');
			return data;
		},
	});

/**
 * Aprobar o rechazar.
 *
 * Aprobar invalida además el equipo: el servidor acaba de crear la ficha, así
 * que la tabla de arriba tiene una fila nueva que esta respuesta no trae.
 */
export const useResolveJoinRequest = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: { id: string; approve: boolean }) => {
			const action = input.approve ? 'approve' : 'reject';
			await axiosInstance.post(`/join-requests/${input.id}/${action}`);
			return input;
		},
		onSuccess: (input) => {
			void queryClient.invalidateQueries({ queryKey: joinRequestKeys.pending });

			if (input.approve) {
				void queryClient.invalidateQueries({ queryKey: staffKeys.all });
			}
		},
	});
};
