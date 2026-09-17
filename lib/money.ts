import { localeForCurrency } from './currencies';

/**
 * Cómo se escribe la plata en el panel.
 *
 * Sin decimales a propósito: los precios de un servicio son redondos —100, 40,
 * 25— y mostrar `100.00` agrega ruido en cada fila sin agregar información. Si
 * algún día hay centavos de verdad, es acá donde se decide, en un solo lugar.
 *
 * El locale sale de la moneda y no está fijo. Estaba fijo en `es-BO`, y con eso
 * un negocio colombiano veía "COP 45.000" en cada precio: el símbolo lo elige el
 * locale, no la moneda. Ver `localeForCurrency`.
 */
export const formatMoney = (value: number, currency: string): string => {
	try {
		return new Intl.NumberFormat(localeForCurrency(currency), {
			style: 'currency',
			currency,
			maximumFractionDigits: 0,
		}).format(value);
	} catch {
		// Un código de moneda inválido no debería tumbar la pantalla entera.
		return `${currency} ${Math.round(value)}`;
	}
};

/** Un importe con su moneda. Espejo de `MoneyTotal` del servidor. */
export interface MoneyTotal {
	currency: string;
	amount: number;
}

/**
 * Los importes agrupados por moneda, de mayor a menor.
 *
 * Un total deja de ser un número en cuanto el catálogo cobra en dos monedas:
 * sumar 300 bolivianos con 40 dólares da 340 de nada. El negocio de una sola
 * moneda —que son casi todos— recibe una lista de un elemento y la pantalla se
 * dibuja igual que antes.
 *
 * Una lista vacía devuelve una lista vacía y no un cero: "no hay nada" no tiene
 * moneda, y quien lo muestre sabe mejor en cuál escribir ese cero.
 */
export const sumByCurrency = (
	items: Iterable<{ price: number; currency: string }>,
): MoneyTotal[] => {
	const totals = new Map<string, number>();

	for (const item of items) {
		totals.set(item.currency, (totals.get(item.currency) ?? 0) + item.price);
	}

	return [...totals]
		.map(([currency, amount]) => ({ currency, amount }))
		.sort(
			(a, b) => b.amount - a.amount || a.currency.localeCompare(b.currency),
		);
};

/**
 * Varios importes escritos uno al lado del otro: `Bs 400 + USD 40`.
 *
 * El separador es un `+` y no una coma porque no son alternativas ni una lista:
 * son dos partes de un mismo total que no se pueden sumar. Sin importes se
 * devuelve un cero en la moneda que indique quien llama, que sabe cuál
 * corresponde.
 */
export const formatTotals = (
	totals: MoneyTotal[],
	fallbackCurrency: string,
): string =>
	totals.length === 0
		? formatMoney(0, fallbackCurrency)
		: totals
				.map((total) => formatMoney(total.amount, total.currency))
				.join(' + ');
