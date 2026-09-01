'use client';

import { Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Props {
	/** Qué aclara, para quien navega sin ver la pantalla. */
	label: string;
	children: React.ReactNode;
	className?: string;
}

/**
 * Lo que una cifra necesita aclarar, detrás de un ⓘ.
 *
 * Acá va lo que se lee una vez en la vida: cómo se calcula un número, qué cuenta
 * y qué no. Impreso debajo de cada cifra, ese mismo texto ocupa lugar para
 * siempre y se lee la primera vez —era lo que pasaba con "Personas distintas.
 * Quien volvió dos veces cuenta una", que es correcto y no hacía falta releer.
 *
 * Es un popover y no un tooltip porque esta pantalla se usa desde el teléfono, y
 * un tooltip que aparece al pasar el mouse no existe cuando no hay mouse.
 */
const InfoHint: React.FC<Props> = ({ label, children, className }) => (
	<Popover>
		<PopoverTrigger asChild>
			<Button
				type="button"
				variant="ghost"
				size="icon-xs"
				className={cn('shrink-0 text-muted-foreground', className)}
				aria-label={label}
			>
				<Info className="h-3.5 w-3.5" />
			</Button>
		</PopoverTrigger>

		<PopoverContent align="end" className="w-72 text-sm">
			{children}
		</PopoverContent>
	</Popover>
);

export default InfoHint;
