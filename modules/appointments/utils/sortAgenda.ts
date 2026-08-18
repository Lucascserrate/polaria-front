type AgendaItem = {
	/** Instante de inicio en milisegundos. */
	sortKey: number;
	/** Duración en minutos, para saber si la cita todavía está en curso. */
	duration: number;
};

/**
 * Ordena la agenda por cercanía al momento actual.
 *
 * El orden cronológico puro deja arriba la cita de las 9 aunque sean las 17, y
 * hay que bajar por toda la mañana ya atendida para ver qué viene. Acá la lista
 * se parte en dos:
 *
 * 1. Lo que falta, de más próximo a más lejano. Lo primero que se ve es lo
 *    siguiente que hay que hacer.
 * 2. Lo que ya pasó, de más reciente a más antiguo.
 *
 * En los dos tramos el criterio es el mismo —cuanto más abajo, más lejos del
 * ahora—, así que la lista se lee alejándose del presente en ambas direcciones.
 *
 * Una cita **en curso** cuenta como pendiente hasta que termina: mientras están
 * atendiendo a alguien, esa tarjeta tiene que seguir arriba y no caer al pasado
 * apenas empieza.
 */
export const sortAgendaByProximity = <T extends AgendaItem>(
	appointments: T[],
	now: number = Date.now(),
): T[] => {
	const hasEnded = (item: T) =>
		item.sortKey + Math.max(0, item.duration) * 60_000 <= now;

	const upcoming: T[] = [];
	const past: T[] = [];

	for (const appointment of appointments) {
		(hasEnded(appointment) ? past : upcoming).push(appointment);
	}

	upcoming.sort((a, b) => a.sortKey - b.sortKey);
	past.sort((a, b) => b.sortKey - a.sortKey);

	return [...upcoming, ...past];
};
