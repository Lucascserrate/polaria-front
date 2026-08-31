import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getClientAppointments } from './clients.service';
import { clientKeys } from './clientKeys';

const useGetClientAppointments = (id?: string | null, page = 1) => {
	return useQuery({
		queryKey: clientKeys.appointments(id ?? '', page),
		queryFn: () => getClientAppointments(id as string, { page }),
		placeholderData: keepPreviousData,
		enabled: !!id,
	});
};

export default useGetClientAppointments;
