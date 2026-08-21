/**
 * Anticipaciones que ofrece el panel, en minutos.
 *
 * La lista es cerrada y coincide con la que valida el backend. Un valor libre
 * habilitaría "2 minutos antes", que produce un aviso inútil.
 */
export const REMINDER_LEAD_OPTIONS = [
	{ minutes: 60, label: '1 hora antes' },
	{ minutes: 180, label: '3 horas antes' },
	{ minutes: 360, label: '6 horas antes' },
	{ minutes: 720, label: '12 horas antes' },
	{ minutes: 1440, label: '24 horas antes' },
] as const;

export const DEFAULT_REMINDER_LEAD_MINUTES = 1440;

/**
 * Por qué los recordatorios todavía no pueden salir, o `null` si pueden.
 *
 * Los recordatorios se envían con una plantilla aprobada por Meta —es la única
 * forma de escribirle a alguien que no escribió en las últimas 24 horas—, y esa
 * aprobación no es instantánea. Sin este aviso, el negocio activaría los
 * recordatorios y no entendería por qué no llega ninguno.
 */
export const describeReminderReadiness = (
	whatsappConnected: boolean,
	templateStatus: string | undefined,
): string | null => {
	if (!whatsappConnected) {
		return 'Conectá WhatsApp para que los recordatorios puedan enviarse.';
	}

	switch (templateStatus) {
		case 'APPROVED':
			return null;
		case 'PENDING':
			return 'Meta está revisando la plantilla del recordatorio. Suele tardar unos minutos; cuando la apruebe, los recordatorios empiezan a salir solos.';
		case 'UNAVAILABLE':
			return 'Meta rechazó o pausó la plantilla del recordatorio, así que por ahora no se puede enviar. Escribinos para revisarlo.';
		default:
			return 'La plantilla del recordatorio todavía no se creó. Se genera sola al conectar WhatsApp.';
	}
};
