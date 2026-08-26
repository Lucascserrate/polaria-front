import { useQuery } from '@tanstack/react-query';
import { getStaffById } from './staff.service';
import { staffKeys } from './staffKeys';
import type { StaffMember } from '@/types/staff.types';

/**
 * Un miembro del equipo, por id.
 *
 * Se pide aparte del listado y no se lee de su caché porque la ficha se abre por
 * URL: al recargar `/team/<id>`, o al entrar desde un enlace, el listado puede no
 * haberse pedido nunca.
 */
const useGetStaffMember = (id?: string) =>
	useQuery<StaffMember>({
		queryKey: staffKeys.detail(id ?? ''),
		queryFn: () => getStaffById(id as string),
		enabled: Boolean(id),
	});

export default useGetStaffMember;
