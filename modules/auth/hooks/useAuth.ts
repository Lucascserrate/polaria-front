import { useQuery } from '@tanstack/react-query';
import { validateToken } from '../auth.service';

const useAuth = () => {
	return useQuery({
		queryKey: ['session'],
		queryFn: validateToken,
	});
};

export default useAuth;
