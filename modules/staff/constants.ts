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

/**
 * La agenda de un día concreto. La fecha entra en la clave para que cada día
 * tenga su propia entrada en caché: volver a uno ya visto lo muestra al
 * instante y después se revalida.
 */
export const dayAppointmentsKey = (date: string) =>
	[...APPOINTMENTS_KEY, 'day', date] as const;

/**
 * Las citas de un rango de días. Los dos extremos entran en la clave: la agenda
 * semanal pide de lunes a domingo, y navegar a la semana anterior es otro rango,
 * no una versión distinta del mismo.
 */
export const rangeAppointmentsKey = (from: string, to: string) =>
	[...APPOINTMENTS_KEY, 'range', from, to] as const;

export const EMPTY_COUNTS = {
	pending: 0,
	confirmed: 0,
	completed: 0,
	cancelled: 0,
};
