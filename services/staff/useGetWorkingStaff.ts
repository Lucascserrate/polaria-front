import { useQuery } from '@tanstack/react-query';
import { getWorkingStaff } from './staff.service';

/** @param date `YYYY-MM-DD`; sin fecha, hoy. */
const useGetWorkingStaff = (date?: string) => {
	return useQuery({
		queryKey: ['staff', 'working', date ?? 'today'],
		// En una lambda porque `getWorkingStaff` recibe un argumento opcional y
		// React Query le pasaría su contexto como ese argumento.
		queryFn: () => getWorkingStaff(date),
	});
};

export default useGetWorkingStaff;
