/**
 * Motivos de caída que informa Meta en `account_update`, en castellano.
 *
 * El motivo solo llega cuando el negocio usaba la app de WhatsApp Business y
 * Cloud API a la vez. Fuera de ese caso guardamos el nombre del evento, así que
 * este mapa tiene que tolerar valores que no están acá.
 */
const REASON_LABELS: Record<string, string> = {
	CHANGE_NUMBER: 'el negocio cambió el número desde WhatsApp',
	USER_RE_REGISTERED: 'el número se registró de nuevo en otro teléfono',
	ACCOUNT_DISCONNECTED: 'la cuenta de WhatsApp se desconectó o fue dada de baja',
	BUSINESS_DOWNGRADE: 'el número pasó a ser una cuenta de WhatsApp normal',
	PRIMARY_INACTIVITY: 'el teléfono principal estuvo demasiado tiempo sin conexión',
	COMPANION_INACTIVITY: 'el dispositivo vinculado estuvo demasiado tiempo sin conexión',
	PARTNER_REMOVED: 'la cuenta se desvinculó de Polaria desde Meta',
	ACCOUNT_OFFBOARDED: 'Meta desvinculó la cuenta',
};

export const describeUnavailableReason = (reason: string | null): string =>
	(reason && REASON_LABELS[reason]) ??
	'Meta no informó el motivo';
