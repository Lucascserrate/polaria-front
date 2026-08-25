"use client";

import HumanAttentionCard from "./HumanAttentionCard";

/**
 * El aviso de atención humana, flotando sobre el calendario.
 *
 * Antes vivía en una columna lateral que ya no existe. Flota y no se integra a
 * la grilla porque no es información del calendario: es alguien esperando del
 * otro lado, y su prioridad no depende de qué día se esté mirando.
 *
 * En móvil sube para no quedar debajo del botón de agregar cita, que ocupa esa
 * misma esquina.
 *
 * La tarjeta no se dibuja cuando no hay nadie esperando, así que este contenedor
 * queda vacío y sin capturar clicks el resto del tiempo: `pointer-events-none`
 * en el marco y `auto` en el contenido, para no tapar la última columna de la
 * semana con un rectángulo invisible.
 */
const FloatingAttention: React.FC = () => (
  <div className="pointer-events-none fixed right-4 bottom-24 z-40 w-[min(20rem,calc(100vw-2rem))] md:bottom-4">
    <div className="pointer-events-auto shadow-lg">
      <HumanAttentionCard />
    </div>
  </div>
);

export default FloatingAttention;
