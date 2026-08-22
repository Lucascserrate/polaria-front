'use client';

import TimelineAppointmentCard from './TimelineAppointmentCard';
import type { AppointmentBlock } from './utils/calendarBlocks';
import { blockGeometry, buildColumnLayout } from './utils/calendarLayout';

/** Separación entre dos citas simultáneas, en porcentaje del ancho disponible. */
const LANE_GAP = 2;

interface Props {
	blocks: AppointmentBlock[];
	onMarkAttended: (id: string) => void;
	onCancel: (id: string) => void;
	updatingId?: string | null;
}

/**
 * Las citas dentro de una columna del calendario.
 *
 * Se dibujan sobre la grilla, no dentro de una celda: la posición es la hora y
 * el alto es la duración, así que la ocupación y los huecos del día se leen sin
 * tener que leer ninguna hora.
 *
 * Lo que se pisa se reparte en carriles. Las canceladas ocupan carril como el
 * resto: un día con tres de cuatro citas caídas tiene que verse como lo que es,
 * y esconderlas del reparto haría que el hueco pareciera disponible.
 */
const AppointmentBlocks: React.FC<Props> = ({
	blocks,
	onMarkAttended,
	onCancel,
	updatingId,
}) => (
	<>
		{buildColumnLayout(blocks).map(({ block, lane, laneCount }) => {
			const geometry = blockGeometry(block);
			const width = 100 / laneCount;

			return (
				<div
					key={block.key}
					// El click no baja a la grilla: sobre una cita, la intención es abrir
					// esa cita y no crear otra en su horario.
					onClick={(event) => event.stopPropagation()}
					/*
					 * La grilla lo usa para apagar el resaltado del hueco: sobre una cita
					 * no hay hueco que ofrecer, y ver los dos a la vez sugería que el
					 * click iba a crear algo.
					 */
					data-appointment=""
					className="absolute z-10 cursor-default"
					style={{
						top: geometry.top,
						height: geometry.height,
						left: `${lane * width}%`,
						width: `calc(${width}% - ${LANE_GAP}%)`,
					}}
				>
					<TimelineAppointmentCard
						appointment={block.appointment}
						startMinute={block.startMinute}
						endMinute={block.endMinute}
						height={geometry.height}
						onMarkAttended={onMarkAttended}
						onCancel={onCancel}
						isUpdating={updatingId === block.appointment.id}
						detail={block.detail}
					/>
				</div>
			);
		})}
	</>
);

export default AppointmentBlocks;
