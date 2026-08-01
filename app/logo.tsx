import { cn } from '@/lib/utils';

/**
 * Wordmark provisional. Todavía no hay logo definitivo, así que la identidad
 * descansa en la tipografía más un glifo de estrella polar. Cuando llegue el
 * logo real, se reemplaza sólo este archivo.
 */
export function Logo({
	tone = 'dark',
	className,
	showWordmark = true,
}: {
	/** "dark" = tinta sobre claro. "light" = blanco sobre oscuro. */
	tone?: 'dark' | 'light';
	className?: string;
	showWordmark?: boolean;
}) {
	return (
		<span
			className={cn(
				'inline-flex items-center gap-2 font-semibold tracking-[-0.03em]',
				tone === 'dark' ? 'text-[#0a0e18]' : 'text-white',
				className,
			)}
		>
			<StarGlyph
				className={cn(
					'size-[1.1em] shrink-0',
					tone === 'dark' ? 'text-cyan-700' : 'text-[#82b4ff]',
				)}
			/>
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
