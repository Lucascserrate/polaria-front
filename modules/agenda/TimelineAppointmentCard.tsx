'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { ContextMenu, ContextMenuTrigger } from '@/components/ui/context-menu';
import {
	OPEN_STATUSES,
	STATUS_COLORS,
} from '@/modules/appointments/utils/constants';
import type { Appointment } from '@/types/appointments.types';
import AppointmentPreview from './AppointmentPreview';
import TimelineCardFace from './TimelineCardFace';
import TimelineCardMenu from './TimelineCardMenu';
import TimelineCardConfirmDialog, {
	type ConfirmingAction,
} from './TimelineCardConfirmDialog';
import { formatMinute } from './utils/calendarLayout';
import { blockSchemeOf } from './utils/blockColor';
import { cn } from '@/lib/utils';
import { DETAIL_HEIGHT, SINGLE_LINE_HEIGHT } from './utils/constants';

interface Props {
	appointment: Appointment;
	startMinute: number;
	endMinute: number;
	height: number;
	/**
	 * Las acciones son opcionales, y su ausencia es lo que hace la card de solo
	 * lectura.
	 *
	 * La usa así la agenda de un profesional, que muestra su día pero no lo edita:
	 * resolver o cancelar una cita sigue siendo del negocio. Pasar funciones vacías
	 * habría llenado el menú con los mismos ítems sin que hicieran nada, que es peor
	 * que no tenerlos —ofrece algo y después no responde—.
	 */
	onMarkAttended?: (id: string) => void;
	onCancel?: (id: string) => void;
	onEdit?: (id: string) => void;
	onDelete?: (id: string) => void;
	isUpdating?: boolean;
	/**
	 * El profesional de la columna, cuando la columna es una persona.
	 *
	 * Solo llega en la vista por profesional. En la semanal viene vacío y el color
	 * se deduce de los tramos: ver `blockSchemeOf`.
	 */
	staffId?: string | null;
	/**
	 * Segunda línea de la card. Por defecto, profesional y servicio.
	 *
	 * En la agenda por profesional se pasa el servicio del tramo: el nombre ya lo
	 * dice la columna, y en una cita compartida diría "Varios" en las dos.
	 */
	detail?: string;
}

/**
 * Una cita dentro de la agenda diaria.
 *
 * La card muestra solo información porque **ni el ancho ni el alto son suyos**:
 * el ancho lo reparten las citas simultáneas y el alto es la duración, o sea
 * 30px para media hora. Por eso el contenido se adapta en tres escalones —hora y
 * cliente en una línea, en dos, y con el servicio— en vez de dibujar siempre lo
 * mismo y recortarlo.
 *
 * Lo que nunca se cae es la hora y el cliente: es lo que se busca al barrer la
 * agenda con la vista. El servicio es información de segundo orden y el detalle
 * completo vive en la vista previa, que es lo que evita tener que abrir una cita
 * para saber si era la que se buscaba.
 *
 * Lo que queda acá es el reparto del espacio; el detalle, el menú y las
 * confirmaciones viven aparte —`AppointmentPreview`, `TimelineCardMenu`,
 * `TimelineCardConfirmDialog`—. Es lo único que este archivo decide de verdad, y
 * mezclado con los otros tres se leía como un archivo sobre cuatro temas.
 *
 * Las acciones viven en el menú del click derecho y no en el detalle: son dos
 * gestos distintos —"quiero saber" y "quiero hacer"— y mezclarlos obligaba a
 * abrir el detalle para resolver algo que ya se sabía al ver la card.
 */
const TimelineAppointmentCard: React.FC<Props> = ({
	appointment,
	startMinute,
	endMinute,
	height,
	onMarkAttended,
	onCancel,
	onEdit,
	onDelete,
	isUpdating = false,
	detail,
	staffId,
}) => {
	const [confirming, setConfirming] = useState<ConfirmingAction>(null);

	const colors = STATUS_COLORS[appointment.status] ?? STATUS_COLORS.confirmed;
	const isOpen = OPEN_STATUSES.includes(appointment.status);

	/**
	 * El color del profesional, o `null` si a esta cita no le corresponde ninguno
	 * —compartida entre dos, o sin asignar—.
	 *
	 * Se reparte así entre color y estado:
	 *
	 * - **La barra lateral siempre lleva el color de la persona.** Es la respuesta a
	 *   "de quién es esto", que es para lo que existe el color, y en la vista
	 *   semanal —donde las citas de todo el equipo se mezclan en una columna— es la
	 *   única forma de saberlo sin abrir la card.
	 * - **El fondo lo tiñe la persona solo mientras la cita está abierta.** Atendida
	 *   y cancelada tienen su propio tratamiento y lo conservan: ahí el dato que
	 *   importa primero es que ya se resolvió, no de quién era.
	 *
	 * Lo que se pierde con esto es la distinción de hue entre pendiente y
	 * confirmada, que la barra llevaba antes. Era `blue-500` contra `sky-500` en
	 * 3 píxeles: dos azules contiguos que en la práctica nadie podía separar. El
	 * estado sigue estando escrito en la card y en el menú.
	 */
	const staffScheme = blockSchemeOf(appointment.segments ?? [], staffId);
	const isCancelled = appointment.status === 'cancelled';
	const isCompleted = appointment.status === 'completed';
	const inline = height < SINGLE_LINE_HEIGHT;
	const showDetail = height >= DETAIL_HEIGHT;
	const timeRange = `${formatMinute(startMinute)}–${formatMinute(endMinute)}`;

	return (
		<ContextMenu>
			<ContextMenuTrigger
				className={cn(
					'block h-full overflow-hidden rounded border py-0.5 pr-1 pl-1.5 text-left transition-shadow hover:shadow-md',
					colors.surface,
				)}
				/*
				 * El tinte va como `background-image` y no como capa aparte ni como
				 * `background-color`.
				 *
				 * No como capa porque un `absolute` se pinta **después** del contenido
				 * estático de su hermano, así que un `inset-0` translúcido quedaría
				 * velando el texto de la cita. Y no como `background-color` porque el
				 * tinte es translúcido y necesita el fondo opaco que trae
				 * `colors.surface`: sin él se vería la grilla a través. Un degradado de
				 * un solo color compone las dos capas en la misma propiedad.
				 */
				style={
					staffScheme && isOpen
						? {
								backgroundImage: `linear-gradient(${staffScheme.tint}, ${staffScheme.tint})`,
							}
						: undefined
				}
			>
				<TimelineCardFace
					onOpen={onEdit ? () => onEdit(appointment.id) : undefined}
					preview={
						<AppointmentPreview
							appointment={appointment}
							timeRange={timeRange}
						/>
					}
				>
					<span
						className={cn(
							'flex min-w-0 items-center gap-1',
							!inline && 'flex-wrap',
						)}
					>
						<span className="shrink-0 font-mono text-[10px] tabular-nums text-foreground">
							{formatMinute(startMinute)}
						</span>

						{isCompleted && (
							<Check
								className="h-3 w-3 shrink-0 text-success"
								aria-label="Atendida"
							/>
						)}

						{inline && (
							<span
								className={cn(
									'min-w-0 flex-1 truncate text-[11px] font-medium',
									isCancelled
										? 'text-muted-foreground line-through'
										: 'text-foreground',
								)}
							>
								{appointment.clientName}
							</span>
						)}
					</span>

					{!inline && (
						<span
							className={cn(
								'block truncate text-[11px] font-medium',
								isCancelled
									? 'text-muted-foreground line-through'
									: 'text-foreground',
							)}
						>
							{appointment.clientName}
						</span>
					)}

					{showDetail && (
						<span className="block truncate text-[10px] text-muted-foreground">
							{detail ?? `${appointment.staff} · ${appointment.service}`}
						</span>
					)}
				</TimelineCardFace>
			</ContextMenuTrigger>

			<TimelineCardMenu
				appointment={appointment}
				isUpdating={isUpdating}
				onMarkAttended={onMarkAttended}
				onEdit={onEdit}
				/*
				 * Las destructivas piden confirmación en vez de ejecutarse, y su presencia
				 * es la que dice si la acción se ofrece: sin `onCancel` no hay nada que
				 * confirmar, así que tampoco hay ítem.
				 */
				onRequestCancel={onCancel ? () => setConfirming('cancel') : undefined}
				onRequestDelete={onDelete ? () => setConfirming('delete') : undefined}
			/>

			<TimelineCardConfirmDialog
				appointment={appointment}
				startMinute={startMinute}
				action={confirming}
				onOpenChange={(open) => {
					if (!open) setConfirming(null);
				}}
				onCancel={onCancel}
				onDelete={onDelete}
			/>
		</ContextMenu>
	);
};

export default TimelineAppointmentCard;
