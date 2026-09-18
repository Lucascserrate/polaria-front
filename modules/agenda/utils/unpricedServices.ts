/**
 * Qué le falta cobrar a una cita.
 *
 * Es puro y vive acá y no en el diálogo por lo mismo que las cuentas del
 * borrador: de esto depende que se pregunte o no el precio al finalizar, y
 * equivocarse no lanza nada —cierra la cita en silencio, sin importe, y esa plata
 * no vuelve a aparecer en ningún reporte—.
 */

export interface FinishingSegment {
	serviceId: string;
	serviceName: string | null;
	staffName?: string | null;
	durationMinutes: number;
	/** `null` es el que todavía no tiene precio. Ver `QUOTED_PRICE_LABEL`. */
	price: number | null;
	currency: string;
}

/** Lo que hace falta saber de la cita que se va a finalizar. */
export interface FinishingBooking {
	id: string;
	clientName?: string | null;
	segments: FinishingSegment[];
}

/**
 * Los servicios de la cita que todavía no tienen precio.
 *
 * Uno por servicio y no uno por tramo: así se pacta el precio y así lo guarda el
 * backend —el mismo servicio dos veces en una cita se cobra una vez—, y preguntar
 * dos veces por lo mismo invita a contestar distinto.
 *
 * El precio cero no entra: es un precio —una cortesía, un retoque sin cargo— y
 * preguntar por él sería no creerle al negocio lo que ya dijo.
 */
export const unpricedServicesOf = (
	booking: FinishingBooking,
): FinishingSegment[] => {
	const seen = new Set<string>();

	return booking.segments.filter((segment) => {
		if (segment.price !== null || seen.has(segment.serviceId)) return false;

		seen.add(segment.serviceId);
		return true;
	});
};
