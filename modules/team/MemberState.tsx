import { StaffMember } from '@/types/staff.types';
import { CircleSlash, Clock } from 'lucide-react';
import React from 'react';
import { accessStateOf } from './utils/access';

/**
 * Lo que hay que decir de alguien además de su nombre, en un solo renglón.
 *
 * Es un renglón y no tres porque las tres cosas no conviven: quien está inactivo
 * no tiene una invitación que aceptar —desactivar también le cierra el acceso— y
 * el cargo es lo que se lee cuando no pasa nada raro. Una columna propia para
 * cada estado sería una columna casi siempre vacía, que deja de leerse justo
 * cuando importa.
 */

const MemberState: React.FC<{
	member: StaffMember;
	fallback?: string | null;
}> = ({ member, fallback }) => {
	if (!member.isActive) {
		return (
			<span className="flex items-center gap-1 text-xs text-muted-foreground">
				<CircleSlash className="size-3 shrink-0" />
				Inactivo
			</span>
		);
	}

	if (accessStateOf(member) === 'INVITED') {
		return (
			<span className="flex items-center gap-1 text-xs text-warning">
				<Clock className="size-3 shrink-0" />
				Invitación pendiente
			</span>
		);
	}

	if (!fallback) return null;

	return (
		<span className="block truncate text-xs text-muted-foreground">
			{fallback}
		</span>
	);
};

export default MemberState;
