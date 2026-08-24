/**
 * Rangos de fechas elegidos a golpes de click.
 *
 * Vive acá y no dentro del selector porque es la regla, no la pintura: qué pasa
 * cuando alguien elige el 20 y después el 5 no es una decisión de maquetado, y
 * es justo el caso que dos `<input type="date">` resolvían mal —dejaban armar un
 * rango invertido y el error recién aparecía del lado del servidor.
 *
 * Las claves son `YYYY-MM-DD`, que se comparan bien como texto: el orden
 * lexicográfico y el cronológico coinciden.
 */

export interface DateRange {
	from: string;
	/** `null` mientras falte el segundo extremo. */
	to: string | null;
}

/**
 * Qué rango queda después de clickear un día.
 *
 * El orden de los clicks no importa: elegir el 20 y después el 5 arma el mismo
 * rango que al revés. Es la única forma de que no exista un rango inválido que
 * después haya que avisar con un cartel rojo.
 *
 * Con el rango ya completo, el click siguiente empieza uno nuevo: quien vuelve a
 * abrir el calendario y toca un día está eligiendo otro período, no corrigiendo
 * el anterior.
 */
export const nextRangeSelection = (
	current: DateRange,
	day: string,
): DateRange => {
	if (current.to !== null) return { from: day, to: null };

	return day < current.from
		? { from: day, to: current.from }
		: { from: current.from, to: day };
};

/** Días del medio del rango: los que se pintan sin ser extremos. */
export const isBetweenRange = (
	day: string,
	from: string,
	to: string | null | undefined,
): boolean => Boolean(to) && day > from && day < (to as string);
