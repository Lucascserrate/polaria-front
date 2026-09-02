'use client';

import * as React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '@/lib/utils';

function Popover({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
	return <PopoverPrimitive.Root data-slot="popover" {...props} />;
}

function PopoverTrigger({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
	return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
	className,
	align = 'center',
	sideOffset = 4,
	portal = true,
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
	/**
	 * Con `false` el contenido se queda donde está en el DOM, sin portal.
	 *
	 * Hace falta dentro de un diálogo con contenido que scrollea. Radix Dialog
	 * bloquea el scroll de la página con `react-remove-scroll` y sólo lo permite
	 * dentro del propio diálogo, que le pasa como única excepción. Un popover
	 * portaleado queda fuera de esa excepción: la rueda del mouse no hace nada
	 * adentro, aunque arrastrar la barra sí, que es una forma bastante
	 * desconcertante de estar roto.
	 */
	portal?: boolean;
}) {
	const Wrapper = portal ? PopoverPrimitive.Portal : React.Fragment;

	return (
		<Wrapper>
			<PopoverPrimitive.Content
				data-slot="popover-content"
				align={align}
				sideOffset={sideOffset}
				className={cn(
					'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden',
					className,
				)}
				{...props}
			/>
		</Wrapper>
	);
}

function PopoverAnchor({
	...props
}: React.ComponentProps<typeof PopoverPrimitive.Anchor>) {
	return <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
