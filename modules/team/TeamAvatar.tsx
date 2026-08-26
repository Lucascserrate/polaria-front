import { cn } from '@/lib/utils';
import { colorOf, fillStyleOf } from './utils/colors';
import { initialsOf } from './utils/initials';

interface Props {
	member: {
		id?: string;
		firstName?: string | null;
		lastName?: string | null;
		name?: string;
		calendarColor?: string | null;
	};
	size?: 'sm' | 'md' | 'lg';
	className?: string;
}

const SIZES = {
	sm: 'size-8 text-[11px]',
	md: 'size-10 text-sm',
	lg: 'size-20 text-2xl',
} as const;

/**
 * El avatar de un miembro del equipo: sus iniciales sobre su color.
 *
 * No hay foto todavía y esto no es un placeholder esperándola. Las iniciales
 * sobre el color del calendario hacen el trabajo que importa —reconocer a alguien
 * de un golpe de vista en una lista o en la agenda— y lo hacen con el mismo color
 * con el que van a aparecer sus citas, que es información que una foto no daría.
 */
const TeamAvatar: React.FC<Props> = ({ member, size = 'md', className }) => (
	<span
		aria-hidden="true"
		// El color va inline y no como clase porque la paleta son hexadecimales
		// propios, no tonos de Tailwind: no existe una clase que los nombre.
		style={fillStyleOf(colorOf(member))}
		className={cn(
			'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
			SIZES[size],
			className,
		)}
	>
		{initialsOf(member)}
	</span>
);

export default TeamAvatar;
