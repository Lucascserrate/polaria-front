/**
 * Cuánto ocupa la barra de una fila dentro de su ranking.
 *
 * Se mide contra **el mayor**, no contra el total. La pregunta de un ranking es
 * "quién puntea y por cuánto": con barras proporcionales al total, un equipo de
 * seis deja a todos por debajo de un tercio del ancho y las diferencias entre
 * ellos dejan de verse, que es justamente lo que la barra vino a mostrar.
 */
export const shareOfMax = (value: number, max: number): number => {
	// Un período sin facturación deja todas las barras en cero en lugar de
	// producir `NaN` y un ancho inválido.
	if (!Number.isFinite(value) || !Number.isFinite(max) || max <= 0) return 0;

	return Math.max(0, Math.min(value / max, 1));
};

/** El mayor valor de una lista, o `0` si está vacía. */
export const maxOf = <T>(entries: T[], pick: (entry: T) => number): number =>
	entries.reduce((max, entry) => {
		const value = pick(entry);
		return Number.isFinite(value) && value > max ? value : max;
	}, 0);
