/**
 * Cuánto dura algo, dicho como lo diría una persona.
 *
 * `90 min` es correcto y se lee mal: nadie dice que un corte dura noventa
 * minutos, dice que dura una hora y media. Debajo de la hora se deja en minutos
 * porque ahí sí es como se habla —"45 min"— y la hora en punto no arrastra un
 * "0 min" que no aporta nada.
 *
 * Vive en un solo lugar porque aparece en la fila de cada servicio, en el total
 * de la reserva y en el catálogo: tres formatos distintos para el mismo dato es
 * exactamente lo que pasa cuando cada pantalla lo arma a mano.
 */
export const formatDuration = (minutes: number): string => {
	if (!Number.isFinite(minutes) || minutes <= 0) return '0 min';

	const hours = Math.floor(minutes / 60);
	const rest = minutes % 60;

	if (hours === 0) return `${rest} min`;
	if (rest === 0) return `${hours} h`;

	return `${hours} h ${rest} min`;
};
