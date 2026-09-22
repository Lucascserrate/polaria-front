/**
 * Hace cuánto que un cliente no viene.
 *
 * La lista no muestra la fecha de la última visita sino los días que pasaron
 * desde entonces, porque es la forma en que el negocio usa el dato: hay quien le
 * escribe a cada clienta a los veintiún días, y para eso "hace 23 días" es una
 * respuesta y "3 de agosto" es una cuenta que hay que hacer en la cabeza, fila
 * por fila.
 *
 * La fecha exacta no se pierde: queda en el `title` de la celda y en la ficha.
 */

/**
 * Días de calendario entre la visita y hoy.
 *
 * Se cuenta por día y no por horas a propósito: una visita de ayer a las ocho de
 * la noche tiene que decir "ayer" aunque no hayan pasado veinticuatro horas.
 * Ambos extremos se llevan a medianoche local, así que los saltos de horario de
 * verano —un día de 23 o 25 horas— los absorbe el redondeo.
 */
export const daysSinceVisit = (iso: string, now: Date = new Date()): number => {
	const visit = new Date(iso);
	visit.setHours(0, 0, 0, 0);

	const today = new Date(now);
	today.setHours(0, 0, 0, 0);

	return Math.round((today.getTime() - visit.getTime()) / 86_400_000);
};

/**
 * El texto de la columna, o `null` cuando el cliente nunca vino.
 *
 * Devuelve `null` en vez de "Nunca" para que cada pantalla decida cómo decirlo:
 * no es lo mismo en una tabla que en la ficha, y sobre todo no es un dato que
 * falte —es alguien que todavía no fue atendido—.
 */
export const formatLastVisit = (
	iso: string | null,
	now?: Date,
): string | null => {
	if (!iso) return null;

	const days = daysSinceVisit(iso, now);

	// Una cita de hoy más tarde no existe acá —el backend sólo cuenta las que ya
	// pasaron—, pero un reloj adelantado en el navegador podría dar negativo.
	if (days <= 0) return 'Hoy';
	if (days === 1) return 'Ayer';
	if (days < 365) return `Hace ${days} días`;

	/*
	 * Pasado el año la cuenta exacta deja de significar algo: entre 400 y 520
	 * días no hay ninguna decisión distinta. El orden de la lista sigue siendo
	 * exacto porque lo resuelve el servidor sobre la fecha, no sobre este texto.
	 */
	const years = Math.floor(days / 365);
	return years === 1 ? 'Hace más de un año' : `Hace más de ${years} años`;
};

const exactFormatter = new Intl.DateTimeFormat('es-BO', {
	day: 'numeric',
	month: 'long',
	year: 'numeric',
});

/** La fecha de la visita, para el `title` de la celda. */
export const formatVisitDate = (iso: string): string =>
	exactFormatter.format(new Date(iso));
