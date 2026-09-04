'use client';

import * as React from 'react';
import * as HoverCardPrimitive from '@radix-ui/react-hover-card';

import { cn } from '@/lib/utils';

function HoverCard({
	openDelay = 400,
	closeDelay = 120,
	...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
	/*
	 * La demora al abrir no es un adorno: sin ella, cruzar la agenda con el mouse
	 * abre y cierra una tarjeta por cada cita que se roza. El default de Radix son
	 * 700ms, que se siente trabado cuando la intención sí era mirar esa cita.
	 *
	 * La demora al cerrar es más corta porque cumple otra función: dar tiempo a
	 * llevar el puntero del disparador al contenido sin que se cierre en el camino.
	 */
	return (
		<HoverCardPrimitive.Root
			data-slot="hover-card"
			openDelay={openDelay}
			closeDelay={closeDelay}
			{...props}
		/>
	);
}

function HoverCardTrigger({
	...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger>) {
	return (
		<HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
	);
}

function HoverCardContent({
	className,
	align = 'start',
	sideOffset = 6,
	...props
}: React.ComponentProps<typeof HoverCardPrimitive.Content>) {
	return (
		<HoverCardPrimitive.Portal>
			<HoverCardPrimitive.Content
				data-slot="hover-card-content"
				align={align}
				sideOffset={sideOffset}
				className={cn(
					'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) overflow-hidden rounded-md border shadow-md outline-hidden',
					className,
				)}
				{...props}
			/>
		</HoverCardPrimitive.Portal>
	);
}

export { HoverCard, HoverCardTrigger, HoverCardContent };
