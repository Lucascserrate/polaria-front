/**
 * Conversaciones esperando atención humana.
 *
 * Se invalida entera al devolver una al bot: la lista es corta y no vale la pena
 * editarla a mano en la caché.
 */
export const HANDOFF_KEY = ['conversations', 'handed-off'] as const;

/**
 * Cada cuánto se releen las conversaciones que esperan atención.
 *
 * Alguien pidió hablar con una persona y está esperando del otro lado, así que la
 * demora en enterarse importa más que en el resto del panel. Como en la agenda,
 * lo que más ayuda es el refetch al volver el foco que React Query hace por
 * defecto; esto solo cubre dejar la pestaña abierta y a la vista.
 */
export const HANDOFF_REFETCH_MS = 20_000;
