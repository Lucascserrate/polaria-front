import type { StaffMember } from '@/types/staff.types';

/**
 * En qué estado está el acceso de alguien a Polaria.
 *
 * Es el espejo de `accessStateOf` del servidor. Se repite acá porque la lista y la
 * ficha tienen que decirlo sin preguntar de nuevo, y son tres campos que ya vienen
 * en la respuesta.
 */
export type AccessState = 'NONE' | 'INVITED' | 'ACTIVE';

export const accessStateOf = (member: {
	accessEmail?: string | null;
	accessGoogleId?: string | null;
}): AccessState => {
	if (!member.accessEmail?.trim()) return 'NONE';
	return member.accessGoogleId ? 'ACTIVE' : 'INVITED';
};

export const hasAccess = (member: StaffMember): boolean =>
	accessStateOf(member) !== 'NONE';

export const ACCESS_LABELS: Record<AccessState, string> = {
	NONE: 'Sin acceso',
	INVITED: 'Invitación pendiente',
	ACTIVE: 'Acceso activo',
};
