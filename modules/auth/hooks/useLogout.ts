import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { logout } from '../auth.service';
import { ROUTES } from '@/constants/routes';

export const useLogout = () => {
	const queryClient = useQueryClient();
	const router = useRouter();

	return useMutation({
		mutationFn: logout,
		onSuccess: () => {
			queryClient.removeQueries({ queryKey: ['session'] });

			router.replace(ROUTES.auth);
		},
	});
};
