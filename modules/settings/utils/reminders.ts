/**
 * Las anticipaciones que expone el panel.
 *
 * El backend acepta más —ver `SUPPORTED_REMINDER_OFFSETS`—, pero acá se ofrecen
 * solo estas dos: son las que cubren los dos motivos reales de avisar. El día
 * anterior sirve para que el cliente reorganice su día; un rato antes, para que
 * no se olvide de salir.
 *
 * Cada una es independiente: pueden estar las dos, una sola o ninguna.
 */
export const REMINDER_TOGGLES = [
	{
		minutes: 1440,
		label: '24 horas antes',
		description: 'Recibir un recordatorio el día anterior.',
	},
	{
		minutes: 60,
		label: '1 hora antes',
		description: 'Recibir un recordatorio poco antes de la cita.',
	},
] as const;

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

/**
 * Los recordatorios activos en una línea, para el índice de Configuración.
 *
 * Dice cuáles están activos y no solo que hay alguno: ahora que son dos
 * independientes, "Activados" dejaría sin resolver la pregunta que trae a
 * alguien a esta pantalla, que es cuándo se avisa.
 */
export const describeReminderOffsets = (offsets: number[]): string => {
	const labels = REMINDER_TOGGLES.filter((option) =>
		offsets.includes(option.minutes),
	).map((option) => option.label.toLowerCase());

	if (labels.length === 0) return 'Desactivados';

	return labels.join(' y ');
};
