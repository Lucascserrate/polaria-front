'use client';

import { useState } from 'react';
import { Ban, Trash2 } from 'lucide-react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import type { ScheduleBlockPiece } from './utils/calendarBlocks';
import { blockGeometry, formatMinute } from './utils/calendarLayout';

/**
 * El rayado de una franja no disponible.
 *
 * Más marcado que el de las horas cerradas —`CLOSED_PATTERN` en `CalendarGrid`—
 * y por eso no se comparte la constante: los dos son "acá no se atiende", pero
 * uno es el horario del negocio y el otro una decisión de hoy que alguien puede
 * deshacer. Si se vieran igual, nadie sabría cuál se puede borrar.
 */
const BLOCKED_PATTERN = {
	backgroundImage:
		'repeating-linear-gradient(45deg, color-mix(in oklab, var(--muted-foreground) 26%, transparent) 0 2px, transparent 2px 6px)',
};

/** Debajo de esto no entra el texto y queda solo la franja rayada. */
const MIN_HEIGHT_FOR_LABEL = 28;

interface Props {
	pieces: ScheduleBlockPiece[];
	/** Sin esto las franjas quedan de solo lectura. */
	onDelete?: (id: string) => void;
	/** El bloqueo cuya baja está viajando: su franja se apaga. */
	deletingId?: string | null;
}

/**
 * Las franjas no disponibles dentro de una columna del calendario.
 *
 * Van a todo el ancho y sin carriles, al contrario de las citas: una cita ocupa
 * a una persona y otra puede convivir al lado, y esto dice que en ese rato no se
 * atiende. Repartirlo en carriles sugeriría que en la mitad libre sí.
 *
 * Por debajo de las citas a propósito. Un bloqueo no las cancela —si había tres
 * turnos a las 15:00 siguen ahí— así que taparlas escondería justamente lo que
 * hay que resolver.
 */
const ScheduleBlockStrips: React.FC<Props> = ({
	pieces,
	onDelete,
	deletingId,
}) => {
	const [pending, setPending] = useState<ScheduleBlockPiece | null>(null);

	return (
		<>
			{pieces.map((piece) => {
				const geometry = blockGeometry(piece);
				const isDeleting = deletingId === piece.block.id;
				const showsLabel = geometry.height >= MIN_HEIGHT_FOR_LABEL;

				/*
				 * De quién es. El del negocio entero no lleva nombre: decir "todo el
				 * negocio" en cada franja gastaría el ancho en lo que ya se ve, que es
				 * que está en todas las columnas.
				 */
				const who = piece.block.staffName;
				const label = [who, piece.block.reason].filter(Boolean).join(' · ');

				return (
					<div
						key={piece.key}
						/*
						 * El click no baja a la grilla: sobre una franja no disponible la
						 * intención no es crear una cita ahí.
						 */
						onClick={(event) => event.stopPropagation()}
						/*
						 * La grilla lo lee para apagar el resaltado del hueco, igual que con
						 * las citas: ver los dos a la vez sugería que el click iba a crear
						 * algo en un rato que está cerrado.
						 */
						data-appointment=""
						className={cn(
							'group absolute inset-x-0 overflow-hidden rounded-sm border border-muted-foreground/25 bg-muted/45',
							isDeleting && 'opacity-50',
						)}
						style={{
							top: geometry.top,
							height: geometry.height,
							...BLOCKED_PATTERN,
						}}
					>
						{showsLabel && (
							<div className="flex items-start gap-1 px-1.5 py-1">
								<Ban className="mt-px size-3 shrink-0 text-muted-foreground" />

								<div className="min-w-0 flex-1 leading-tight">
									<p className="truncate text-[10px] font-medium text-muted-foreground">
										{label || 'No disponible'}
									</p>
									<p className="font-mono text-[9px] tabular-nums text-muted-foreground/80">
										{`${formatMinute(piece.startMinute)}–${formatMinute(piece.endMinute)}`}
									</p>
								</div>

								{onDelete && (
									/*
									 * Siempre a la vista y no al pasar el mouse por encima, como
									 * el resto de la agenda: hay negocios que la usan desde un
									 * teléfono, donde no hay hover.
									 */
									<button
										type="button"
										aria-label="Quitar el horario no disponible"
										title="Quitar el horario no disponible"
										disabled={isDeleting}
										onClick={() => setPending(piece)}
										className="shrink-0 cursor-pointer rounded-sm p-0.5 text-muted-foreground transition-colors hover:bg-background/70 hover:text-destructive"
									>
										<Trash2 className="size-3" />
									</button>
								)}
							</div>
						)}
					</div>
				);
			})}

			<AlertDialog
				open={Boolean(pending)}
				onOpenChange={(open) => {
					if (!open) setPending(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							¿Quitar este horario no disponible?
						</AlertDialogTitle>
						<AlertDialogDescription>
							{pending
								? `Vuelve a ofrecerse para reservas desde las ${formatMinute(pending.startMinute)}. Las citas que ya estaban no cambian.`
								: null}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive hover:bg-destructive/90"
							onClick={() => {
								const piece = pending;
								setPending(null);
								if (piece) onDelete?.(piece.block.id);
							}}
						>
							Quitar
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};

export default ScheduleBlockStrips;
