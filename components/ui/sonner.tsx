'use client';

import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from 'lucide-react';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

import { useIsDarkTheme } from '@/components/use-theme-preference';

/**
 * Los avisos que aparecen y se van.
 *
 * El tema sale de `useIsDarkTheme` y no del `useTheme` de `next-themes` que
 * traía el componente de fábrica: acá no hay provider de esa librería —el tema
 * vive en `theme-preference`, con su propio `localStorage` y el script que corre
 * antes del contenido—, así que ese hook devolvía siempre "system" y un negocio
 * con el tema oscuro elegido a mano, sobre un sistema claro, recibía los avisos
 * en blanco.
 *
 * Se le pasa `light` o `dark` ya resuelto por el mismo motivo por el que
 * `useIsDarkTheme` existe: sonner dibuja su propio color y no puede leerlo de
 * una clase.
 *
 * Tampoco lleva el `classNames: { toast: 'cn-toast' }` que traía: esa clase es
 * de una hoja de estilos que el registro instala aparte y que este proyecto no
 * tiene, así que apuntaba a nada. El aspecto sale de los estilos propios de
 * sonner con las variables de abajo, que son las del tema.
 */
const Toaster = ({ ...props }: ToasterProps) => {
	const isDark = useIsDarkTheme();

	return (
		<Sonner
			theme={isDark ? 'dark' : 'light'}
			className="toaster group"
			icons={{
				success: <CircleCheckIcon className="size-4" />,
				info: <InfoIcon className="size-4" />,
				warning: <TriangleAlertIcon className="size-4" />,
				error: <OctagonXIcon className="size-4" />,
				loading: <Loader2Icon className="size-4 animate-spin" />,
			}}
			style={
				{
					'--normal-bg': 'var(--popover)',
					'--normal-text': 'var(--popover-foreground)',
					'--normal-border': 'var(--border)',
					'--border-radius': 'var(--radius)',
				} as React.CSSProperties
			}
			{...props}
		/>
	);
};

export { Toaster };
