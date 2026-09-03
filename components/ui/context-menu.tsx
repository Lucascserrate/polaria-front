'use client';

import * as React from 'react';
import * as ContextMenuPrimitive from '@radix-ui/react-context-menu';

import { cn } from '@/lib/utils';

function ContextMenu({
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
	return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />;
}

function ContextMenuTrigger({
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
	return (
		<ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
	);
}

function ContextMenuContent({
	className,
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
	return (
		<ContextMenuPrimitive.Portal>
			<ContextMenuPrimitive.Content
				data-slot="context-menu-content"
				className={cn(
					'bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 z-50 min-w-48 origin-(--radix-context-menu-content-transform-origin) overflow-hidden rounded-md border p-1 shadow-md',
					className,
				)}
				{...props}
			/>
		</ContextMenuPrimitive.Portal>
	);
}

function ContextMenuItem({
	className,
	variant = 'default',
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item> & {
	/** `destructive` para lo que no se puede deshacer desde la misma card. */
	variant?: 'default' | 'destructive';
}) {
	return (
		<ContextMenuPrimitive.Item
			data-slot="context-menu-item"
			data-variant={variant}
			className={cn(
				'relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none',
				'focus:bg-accent focus:text-accent-foreground',
				'data-disabled:pointer-events-none data-disabled:opacity-50',
				"[&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
				variant === 'destructive' &&
					'text-destructive focus:bg-destructive/10 focus:text-destructive dark:focus:bg-destructive/20',
				className,
			)}
			{...props}
		/>
	);
}

function ContextMenuSeparator({
	className,
	...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
	return (
		<ContextMenuPrimitive.Separator
			data-slot="context-menu-separator"
			className={cn('bg-border -mx-1 my-1 h-px', className)}
			{...props}
		/>
	);
}

export {
	ContextMenu,
	ContextMenuTrigger,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuSeparator,
};
