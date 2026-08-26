import { useMutation, useQueryClient } from '@tanstack/react-query';
import { grantStaffAccess, revokeStaffAccess } from './staff.service';
import { staffKeys } from './staffKeys';

/**
 * Otorgar y revocar el acceso a Polaria.
 *
 * Van juntas en un hook porque son la misma decisión en los dos sentidos, y las
 * dos invalidan lo mismo: la ficha abierta y el listado, que muestra el estado del
 * acceso en su propia columna.
 */
export const useGrantStaffAccess = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, email }: { id: string; email: string }) =>
			grantStaffAccess(id, email),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: staffKeys.all });
		},
	});
};

export const useRevokeStaffAccess = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => revokeStaffAccess(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: staffKeys.all });
		},
	});
};
