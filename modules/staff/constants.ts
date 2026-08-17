/**
 * Cada cuánto se recarga la agenda con la pestaña a la vista.
 *
 * Lo que de verdad evita tener que refrescar a mano es el refetch al volver el
 * foco, que React Query hace por defecto: quien atiende alterna entre WhatsApp y
 * el panel, y al volver encuentra la agenda al día sin haber gastado una sola
 * petición mientras no estaba mirando. Este intervalo solo cubre el caso de
 * dejarla abierta y a la vista, y React Query no consulta en segundo plano.
 */
export const AGENDA_REFETCH_MS = 30_000;

/**
 * Raíz de las consultas de citas.
 *
 * Invalidarla alcanza a todo lo que cuelgue de ella —la agenda de hoy y lo que se
 * agregue después—, que es lo que corresponde cuando aparece una cita nueva:
 * puede no ser de hoy y tiene que verse igual en el listado.
 */
export const APPOINTMENTS_KEY = ['appointments'] as const;

export const TODAY_APPOINTMENTS_KEY = [...APPOINTMENTS_KEY, 'today'] as const;

export const EMPTY_COUNTS = {
	pending: 0,
	booked: 0,
	confirmed: 0,
	completed: 0,
	cancelled: 0,
};
