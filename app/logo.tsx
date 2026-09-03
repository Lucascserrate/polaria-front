import { cn } from '@/lib/utils';

/**
 * Los dos tratamientos del wordmark, y el que elige solo según el tema.
 *
 * `auto` no inventa colores: usa el tratamiento claro cuando la pantalla es
 * clara y el oscuro cuando es oscura, que es exactamente para lo que ya existían
 * los dos. Por eso es el valor por defecto —el único lugar donde hoy se dibuja
 * el logo es el menú, que cambia de color con el tema—, y `dark` y `light`
 * quedan para forzarlo donde el fondo no lo decide el tema, como un banner.
 */
const TONES = {
	dark: { wordmark: 'text-[#0a0e18]', glyph: 'text-[#222]' },
	light: { wordmark: 'text-white', glyph: 'text-[#82b4ff]' },
	auto: {
		wordmark: 'text-[#0a0e18] dark:text-white',
		glyph: 'text-[#222] dark:text-[#82b4ff]',
	},
} as const;

/**
 * Wordmark provisional. Todavía no hay logo definitivo, así que la identidad
 * descansa en la tipografía más un glifo de estrella polar. Cuando llegue el
 * logo real, se reemplaza sólo este archivo.
 */
export function Logo({
	tone = 'auto',
	className,
	showWordmark = true,
}: {
	/**
	 * "dark" = tinta sobre claro. "light" = blanco sobre oscuro. "auto" = el que
	 * corresponda al tema.
	 */
	tone?: keyof typeof TONES;
	className?: string;
	showWordmark?: boolean;
}) {
	return (
		<span
			className={cn(
				'inline-flex items-center gap-2 font-semibold tracking-[-0.03em]',
				TONES[tone].wordmark,
				className,
			)}
		>
			<StarGlyph className={cn('size-[1.1em] shrink-0', TONES[tone].glyph)} />
			{showWordmark && <span className="leading-none">Polaria</span>}
		</span>
	);
}

export function StarGlyph({ className }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="none"
			aria-hidden="true"
			className={className}
		>
			<path
				d="M12 1.5c.62 5.6 4.9 9.88 10.5 10.5-5.6.62-9.88 4.9-10.5 10.5-.62-5.6-4.9-9.88-10.5-10.5C7.1 11.38 11.38 7.1 12 1.5Z"
				fill="currentColor"
			/>
		</svg>
	);
}
