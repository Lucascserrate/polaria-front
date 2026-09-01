/**
 * Cómo viene el período contra el anterior.
 *
 * Se calcula sobre lo generado y no sobre la comisión aunque el titular sea la
 * comisión: como la tasa es la misma para los dos períodos, el porcentaje de
 * variación es idéntico, y lo generado siempre existe —la comisión puede ser
 * `null`—. Una sola cuenta que sirve para los dos casos.
 */

export type Trend = 'up' | 'down' | 'flat' | 'none';

export interface RevenueComparison {
	trend: Trend;
	/**
	 * La variación redondeada a entero y **sin signo**: el signo lo dice `trend`.
	 *
	 * `null` cuando no hay porcentaje posible porque el período anterior fue cero.
	 * No es lo mismo que no haber mejorado: pasar de 0 a 200 es la mejor noticia
	 * posible y la única que no se puede escribir como porcentaje.
	 */
	percent: number | null;
}

export const compareRevenue = (
	current: number,
	previous: number,
): RevenueComparison => {
	if (previous === 0) {
		// Sin nada con qué comparar, o no hay noticia, o la noticia no es un número.
		return current > 0
			? { trend: 'up', percent: null }
			: { trend: 'none', percent: null };
	}

	const percent = Math.round(((current - previous) / previous) * 100);

	/*
	 * Una diferencia que redondea a cero se informa como "igual" y no como un 0%
	 * con flecha: la flecha promete una dirección que un 0.4% no tiene.
	 */
	if (percent === 0) return { trend: 'flat', percent: 0 };

	return { trend: percent > 0 ? 'up' : 'down', percent: Math.abs(percent) };
};
