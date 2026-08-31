import { cn } from '@/lib/utils';
import { colorOf, fillStyleOf } from '@/modules/team/utils/colors';
import { initialsOf } from '@/modules/team/utils/initials';

interface Props {
	client: { id: string; name?: string };
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

const SIZES = {
	sm: 'size-8 text-[11px]',
	md: 'size-10 text-sm',
	lg: 'size-20 text-2xl',
} as const;

/**
 * Las iniciales del cliente sobre un color derivado de su id.
 *
 * El color no lo elige nadie —a diferencia del equipo, donde identifica a la
 * persona en la agenda— pero sale de la misma paleta y del mismo hash. Sirve
 * para lo único que tiene que servir acá: que dos filas seguidas no se
 * confundan al pasar la vista por la lista.
 */
const ClientAvatar: React.FC<Props> = ({ client, size = 'md', className }) => (
	<span
		aria-hidden="true"
		style={fillStyleOf(colorOf(client))}
		className={cn(
			'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
			SIZES[size],
			className,
		)}
	>
		{initialsOf(client)}
	</span>
);

export default ClientAvatar;
