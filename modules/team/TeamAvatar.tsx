import Image from 'next/image';
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
		photoUrl?: string | null;
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
 * Cuántos píxeles mide cada tamaño, para `next/image`.
 *
 * Es la misma medida que las clases de `SIZES`, escrita en números porque el
 * optimizador necesita saber el tamaño de entrega para pedirle a Cloudinary la
 * imagen justa: sin esto se descargarían 512px para un círculo de 32.
 */
const PIXELS = { sm: 32, md: 40, lg: 80 } as const;

const TeamAvatar: React.FC<Props> = ({ member, size = 'md', className }) => (
	<span
		aria-hidden="true"
		// El color va inline y no como clase porque la paleta son hexadecimales
		// propios, no tonos de Tailwind: no existe una clase que los nombre.
		style={fillStyleOf(colorOf(member))}
		className={cn(
			'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold',
			SIZES[size],
			className,
		)}
	>
		{member.photoUrl ? (
			<Image
				src={member.photoUrl}
				alt=""
				width={PIXELS[size]}
				height={PIXELS[size]}
				className="size-full object-cover"
			/>
		) : (
			initialsOf(member)
		)}
	</span>
);

export default TeamAvatar;
