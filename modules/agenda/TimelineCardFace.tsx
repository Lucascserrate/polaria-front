'use client';

import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@/components/ui/hover-card';

/**
 * La cara de la card de una cita, y qué pasa al tocarla.
 *
 * Son dos comportamientos y la diferencia no es de gusto: **quien puede editar
 * entra a editar; quien no, mira el detalle.**
 *
 * Con permiso para editar, el click abre el panel de la reserva y el detalle
 * queda en el hover. Ese reparto es el que resuelve el conflicto: el click ya
 * está ocupado por la acción, así que la única forma de espiar una cita sin
 * navegar a ella es pasando el mouse por encima.
 *
 * Sin permiso —la agenda de un profesional, que mira su día pero no lo decide—
 * el mismo detalle se abre con un click. No lleva hover a propósito: sería un
 * segundo camino a lo mismo, y el click es el que además funciona en una pantalla
 * táctil, donde ni el hover ni el menú del click derecho existen.
 */
const TimelineCardFace: React.FC<{
	/** Ausente deja la card en modo detalle. */
	onOpen?: () => void;
	/**
	 * Si el detalle del hover está abierto, gobernado desde afuera.
	 *
	 * No alcanza con que lo maneje Radix solo: el detalle es para *mirar*, y en
	 * cuanto se pasa a hacer algo —abrir el menú de la cita, entrar a editarla—
	 * tiene que irse, porque si no se queda tapando justo eso. Quién está haciendo
	 * algo lo sabe la card, no esta cara.
	 *
	 * Ausente, el hover se gobierna solo, que es lo que hacía antes.
	 */
	previewOpen?: boolean;
	onPreviewOpenChange?: (open: boolean) => void;
	preview: React.ReactNode;
	children: React.ReactNode;
}> = ({ onOpen, previewOpen, onPreviewOpenChange, preview, children }) => {
	const className =
		'block h-full w-full cursor-pointer rounded-sm text-left leading-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-ring';

	if (onOpen) {
		return (
			<HoverCard open={previewOpen} onOpenChange={onPreviewOpenChange}>
				<HoverCardTrigger asChild>
					<button type="button" className={className} onClick={onOpen}>
						{children}
					</button>
				</HoverCardTrigger>

				<HoverCardContent>{preview}</HoverCardContent>
			</HoverCard>
		);
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button type="button" className={className}>
					{children}
				</button>
			</PopoverTrigger>

			<PopoverContent align="start" className="w-64 overflow-hidden p-0">
				{preview}
			</PopoverContent>
		</Popover>
	);
};

export default TimelineCardFace;
