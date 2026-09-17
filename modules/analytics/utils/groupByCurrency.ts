/**
 * Agrupa por moneda conservando el orden de llegada dentro de cada grupo, y
 * ordena los grupos por lo que factura cada uno.
 *
 * El orden importa: la moneda principal del negocio tiene que quedar arriba sin
 * que haga falta decirle cuál es.
 */
const groupByCurrency = <T>(
	items: T[],
	currencyOf: (item: T) => string,
	amountOf: (item: T) => number,
): Array<[string, T[]]> => {
	const groups = new Map<string, T[]>();
	const totals = new Map<string, number>();

	for (const item of items) {
		const currency = currencyOf(item);
		groups.set(currency, [...(groups.get(currency) ?? []), item]);
		totals.set(currency, (totals.get(currency) ?? 0) + amountOf(item));
	}

	return [...groups].sort(
		(a, b) =>
			(totals.get(b[0]) ?? 0) - (totals.get(a[0]) ?? 0) ||
			a[0].localeCompare(b[0]),
	);
};

export default groupByCurrency;
