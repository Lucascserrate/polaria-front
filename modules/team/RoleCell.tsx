import { cn } from '@/lib/utils';
import { StaffMember } from '@/types/staff.types';
import { ROLE_LABELS } from './utils/roles';

/**
 * La función de alguien, y si además atiende.
 *
 * Se dicen las dos cosas porque son dos: "Administrador" solo no distingue al que
 * lleva la caja del dueño que también corta pelo, y esa diferencia es la que
 * explica por qué uno aparece en la agenda y el otro no.
 */
const RoleCell: React.FC<{ member: StaffMember }> = ({ member }) => {
	const role = member.accessRole ?? 'PROFESSIONAL';
	const provides = member.providesServices ?? true;

	return (
		<span className="block">
			<span className="block text-sm">{ROLE_LABELS[role]}</span>
			<span
				className={cn(
					'block text-xs',
					provides ? 'text-muted-foreground' : 'text-warning',
				)}
			>
				{provides ? 'Atiende clientes' : 'No atiende'}
			</span>
		</span>
	);
};

export default RoleCell;
