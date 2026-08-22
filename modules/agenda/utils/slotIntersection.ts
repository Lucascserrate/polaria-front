/**
 * A qué horas puede empezar una reserva de varios servicios.
 *
 * El motor de disponibilidad responde por servicio y profesional: "¿a qué horas
 * puede Diego hacer un corte?". Una reserva de dos servicios con dos personas
 * necesita las dos respuestas a la vez, y no en cualquier momento sino **en
 * cadena**: si el corte empieza a las 09:00 y dura media hora, la barba tiene que
 * poder empezar a las 09:30 con la otra persona.
 *
 * Por eso esto no es una intersección de horarios sueltos: cada tramo se
 * pregunta desplazado por lo que dura lo anterior. Es puro para poder probarlo:
 * un desplazamiento mal aplicado ofrece horarios que después el backend rechaza,
 * y eso se ve como "guardé y me dijo que no estaba disponible".
 */

export interface SlotItemAvailability {
	/** Minutos desde el inicio de la reserva en que arranca este tramo. */
	offsetMinutes: number;
	/** Inicios que el motor ofrece para ese tramo, en ISO. */
	startTimes: string[];
}

const toMillis = (iso: string): number => new Date(iso).getTime();

/**
 * Los inicios posibles de la reserva completa.
 *
 * Un solo tramo devuelve sus propios horarios. Con varios, sobrevive el inicio
 * en el que **todos** los tramos entran en su lugar.
 */
export const intersectSlotStarts = (
	items: SlotItemAvailability[],
): string[] => {
	if (items.length === 0) return [];

	const base = items.find((item) => item.offsetMinutes === 0);
	// Sin un tramo que arranque con la reserva no hay desde dónde contar.
	if (!base) return [];

	const others = items.filter((item) => item !== base);

	const startsByOffset = new Map<number, Set<number>>();
	for (const item of others) {
		startsByOffset.set(
			item.offsetMinutes,
			new Set(item.startTimes.map(toMillis)),
		);
	}

	const candidates = [...new Set(base.startTimes)]
		.filter((iso) => Number.isFinite(toMillis(iso)))
		.sort((a, b) => toMillis(a) - toMillis(b));

	return candidates.filter((iso) => {
		const start = toMillis(iso);

		for (const [offsetMinutes, starts] of startsByOffset) {
			if (!starts.has(start + offsetMinutes * 60_000)) return false;
		}

		return true;
	});
};
