/**
 * Cómo se lee el estado de un recordatorio en la agenda.
 *
 * El dueño necesita responder una sola pregunta desde la cita: ¿le avisamos al
 * cliente? Y cuando la respuesta es no, por qué. Los motivos vienen del backend
 * como códigos; acá se traducen a algo que se pueda accionar.
 */

const REASONS: Record<string, string> = {
	NO_CLIENT_PHONE: 'el cliente no tiene teléfono cargado',
	LEAD_TIME_PASSED: 'se agendó con menos anticipación que la configurada',
	REMINDERS_DISABLED: 'los recordatorios están desactivados',
	APPOINTMENT_INACTIVE: 'la cita se canceló o ya se atendió',
	INVALID_LEAD: 'la anticipación configurada no es válida',
	TEMPLATE_NOT_APPROVED: 'Meta todavía no aprobó la plantilla',
	NO_WHATSAPP_CONNECTION: 'no hay WhatsApp conectado',
	APPOINTMENT_CHANGED: 'la cita cambió de horario después de programarlo',
	SEND_INTERRUPTED: 'se interrumpió el envío',
};

export interface ReminderInfo {
	state: string;
	scheduledFor: string | null;
	sentAt: string | null;
	failureReason: string | null;
}

export type ReminderDisplay = {
	label: string;
	/** `muted` no pide atención; `warning` sí. */
	tone: 'muted' | 'warning';
};

const shortDateTime = (iso: string) =>
	new Intl.DateTimeFormat('es', {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).format(new Date(iso));

const describeReason = (reason: string | null) =>
	(reason && REASONS[reason]) ?? 'motivo no informado';

export const describeReminder = (
	reminder: ReminderInfo | null | undefined,
): ReminderDisplay | null => {
	// Sin fila no hay nada que decir: la reconciliación corre cada pocos minutos,
	// así que una cita recién creada todavía no tiene recordatorio y afirmar algo
	// sobre él sería inventar.
	if (!reminder) return null;

	switch (reminder.state) {
		case 'SCHEDULED':
			return {
				label: reminder.scheduledFor
					? `Recordatorio programado para el ${shortDateTime(reminder.scheduledFor)}`
					: 'Recordatorio programado',
				tone: 'muted',
			};
		case 'SENDING':
			return { label: 'Recordatorio enviándose', tone: 'muted' };
		case 'SENT':
			return {
				label: reminder.sentAt
					? `Recordatorio enviado el ${shortDateTime(reminder.sentAt)}`
					: 'Recordatorio enviado',
				tone: 'muted',
			};
		case 'SKIPPED':
			return {
				label: `Sin recordatorio: ${describeReason(reminder.failureReason)}`,
				tone: 'warning',
			};
		case 'CANCELLED':
			return {
				label: `Recordatorio cancelado: ${describeReason(reminder.failureReason)}`,
				tone: 'muted',
			};
		case 'FAILED':
			return {
				label: `El recordatorio falló: ${describeReason(reminder.failureReason)}`,
				tone: 'warning',
			};
		default:
			return null;
	}
};
