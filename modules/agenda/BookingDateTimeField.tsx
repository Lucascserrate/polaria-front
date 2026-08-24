'use client';

import { ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { describeDay } from './utils/calendarLabels';

interface Props {
	/** Día del horario elegido, o `null` si todavía no hay ninguno. */
	dayKey: string | null;
	/** Hora ya formateada en la zona del negocio. */
	time: string;
	/** Segunda línea: cuándo termina, o el aviso de que hay cambios sin guardar. */
	detail: string;
	/** Sin esto la fila es informativa y no invita a tocarla. */
	editable?: boolean;
	onOpen: () => void;
}

/**
 * Cuándo es la reserva.
 *
 * Es una fila y no un formulario porque elegir día y hora necesita más espacio
 * del que hay en el panel: al tocarla, el drawer cambia al paso de horarios. Con
 * un selector de fecha y otro de hora acá adentro no habría lugar para mostrar
 * qué horarios están libres, que es la información que hace falta para elegir.
 */
const BookingDateTimeField: React.FC<Props> = ({
	dayKey,
	time,
	detail,
	editable = true,
	onOpen,
}) => (
	<button
		type="button"
		disabled={!editable}
		onClick={onOpen}
		className={cn(
			'flex w-full items-start gap-3 rounded-lg p-2 text-left transition-colors',
			editable ? 'hover:bg-muted/60' : 'cursor-default',
		)}
	>
		<span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
			<Clock className="h-4 w-4 text-muted-foreground" />
		</span>

		<div className="min-w-0 flex-1">
			<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
				Fecha y hora
			</p>
			<p className="text-sm font-medium">
				{dayKey ? `${describeDay(dayKey)} · ${time}` : 'Elegir fecha y hora'}
			</p>
			<p className="text-xs text-muted-foreground">{detail}</p>
		</div>

		{editable && (
			<ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
		)}
	</button>
);

export default BookingDateTimeField;
