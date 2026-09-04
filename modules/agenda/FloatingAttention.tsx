'use client';

import HumanAttentionCard from './HumanAttentionCard';
import UnresolvedAppointmentsCard from './UnresolvedAppointmentsCard';

/**
 * Los avisos que piden algo del negocio, flotando sobre el calendario.
 *
 * Antes vivían en una columna lateral que ya no existe. Flotan y no se integran a
 * la grilla porque no son información del calendario: son cosas pendientes, y su
 * prioridad no depende de qué día se esté mirando.
 *
 * **El orden es el de la urgencia y no el del código.** Atención humana va arriba
 * porque hay alguien esperando ahora mismo del otro lado; las citas sin cerrar son
 * deuda acumulada —importante, pero de ayer—, y ponerlas primero haría esperar a
 * una persona real detrás de una tarea administrativa.
 *
 * En móvil sube para no quedar debajo del botón de agregar cita, que ocupa esa
 * misma esquina.
 *
 * Cada tarjeta se borra sola cuando no tiene nada que decir, así que este
 * contenedor queda vacío y sin capturar clicks el resto del tiempo:
 * `pointer-events-none` en el marco y `auto` en el contenido, para no tapar la
 * última columna de la semana con un rectángulo invisible.
 */
const FloatingAttention: React.FC = () => (
	<div className="pointer-events-none fixed right-4 bottom-24 z-40 flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-3 md:bottom-4">
		<div className="pointer-events-auto shadow-lg">
			<HumanAttentionCard />
		</div>
		<div className="pointer-events-auto shadow-lg">
			<UnresolvedAppointmentsCard />
		</div>
	</div>
);

export default FloatingAttention;
