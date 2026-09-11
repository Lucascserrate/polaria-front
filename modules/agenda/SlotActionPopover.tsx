'use client';

import { Ban, CalendarPlus, X } from 'lucide-react';
import {
	Popover,
	PopoverAnchor,
	PopoverContent,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

/**
 * Qué se puede hacer con un hueco de la agenda.
 *
 * Aparece al tocar un hueco, anclado al hueco mismo. Existe porque el click
 * pasó a significar dos cosas: hasta ahora abría el panel de reserva, que era la
 * única, y marcar un rato como no disponible es la otra —y no tiene por qué
 * pasar por un formulario de cita para llegar—.
 *
 * No sabe de qué hueco se trata: recibe la hora ya escrita y dos funciones. Es
 * lo que permite que la grilla lo ubique sin saber qué hay adentro, igual que
 * hace con las citas.
 */
const SlotActionPopover: React.FC<{
	/** La hora del hueco, tal como se muestra. */
	label: string;
	onAddAppointment: () => void;
	/**
	 * Ausente, la acción se ofrece apagada.
	 *
	 * Se muestra igual en vez de esconderse: que se vea lo que va a haber ahí es
	 * lo que evita que alguien la busque en otro lado mientras tanto.
	 */
	onAddBlock?: () => void;
	onClose: () => void;
}> = ({ label, onAddAppointment, onAddBlock, onClose }) => (
	<Popover open onOpenChange={(open) => !open && onClose()}>
		{/* Ocupa el hueco entero: es a lo que se pega la tarjeta. */}
		<PopoverAnchor className="block h-full w-full" />

		<PopoverContent
			align="start"
			className="w-64 overflow-hidden p-0"
			/*
			 * Contra los bordes de la pantalla. La agenda se mira en pantallas
			 * angostas y la primera columna arranca pegada a la regla de horas: sin
			 * esto, un hueco del lunes temprano abre la tarjeta mitad afuera.
			 */
			collisionPadding={8}
			onOpenAutoFocus={(event) => {
				/*
				 * El foco se queda donde estaba.
				 *
				 * Radix lo lleva solo al primer botón, y ahí el navegador desplaza la
				 * grilla para mostrarlo: tocar un hueco de la tarde movía la vista sola
				 * justo cuando acabás de elegir dónde mirar.
				 */
				event.preventDefault();
			}}
		>
			<div className="flex items-center justify-between gap-2 border-b border-border bg-muted/60 px-3 py-2">
				<span className="font-mono text-sm font-semibold tabular-nums">
					{label}
				</span>
				<button
					type="button"
					className="cursor-pointer rounded-sm text-muted-foreground transition-colors hover:text-foreground"
					aria-label="Cerrar"
					onClick={onClose}
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			<div className="py-1">
				<Action icon={<CalendarPlus />} onClick={onAddAppointment}>
					Añadir cita
				</Action>

				<Action icon={<Ban />} onClick={onAddBlock}>
					Añadir horario no disponible
				</Action>
			</div>
		</PopoverContent>
	</Popover>
);

/**
 * Una fila del menú.
 *
 * Sin `onClick` queda apagada y con su leyenda: es la forma de ofrecer algo que
 * todavía no está sin que parezca que se rompió.
 */
const Action: React.FC<{
	icon: React.ReactNode;
	onClick?: () => void;
	children: React.ReactNode;
}> = ({ icon, onClick, children }) => (
	<button
		type="button"
		disabled={!onClick}
		className={cn(
			'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
			'[&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-muted-foreground',
			onClick
				? 'cursor-pointer hover:bg-muted'
				: 'cursor-default text-muted-foreground',
		)}
		onClick={onClick}
	>
		{icon}
		<span className="flex-1">{children}</span>
		{!onClick && (
			<span className="shrink-0 text-[10px] tracking-wider uppercase">
				Pronto
			</span>
		)}
	</button>
);

export default SlotActionPopover;
