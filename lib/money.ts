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

/**
 * Lo que se escribe donde iría el precio de un servicio que no lo tiene.
 *
 * Hay rubros que no pueden publicar un precio: una coloración depende del largo
 * y del estado del pelo, un tratamiento de piel de lo que se vea en la consulta.
 * El negocio no lo esconde, lo cotiza cuando ve a la persona.
 *
 * Es la misma frase que el servidor manda a WhatsApp y a la página pública
 * (`quoted-price.ts`), y está duplicada porque no hay un paquete compartido entre
 * los dos. Si cambia, cambia en los dos lados: el mismo servicio no puede decir
 * una cosa en el panel y otra en el chat.
 */
export const QUOTED_PRICE_LABEL = 'Requiere diagnóstico';

/**
 * El precio como número, o `null` si no hay.
 *
 * Existe porque `Number(null)` es `0`, y ese cero no falla en ningún lado: se
 * muestra, se suma y convierte un servicio que se cotiza en uno gratis. Cada
 * precio que llega del backend pasa por acá.
 *
 * MySQL devuelve los `decimal` como string aunque el tipo diga `number`, así que
 * también se encarga de eso: sumar sobre el string no falla, concatena, y un
 * total de 100 se veía como `0100.00`.
 */
export const toPrice = (
	value: number | string | null | undefined,
): number | null => {
	if (value === null || value === undefined || value === '') return null;

	const amount = Number(value);
	return Number.isFinite(amount) ? amount : null;
};

/**
 * El precio de un servicio listo para mostrar: el importe, o el aviso.
 *
 * Donde hay una columna de precios, el hueco se lee como un error de la
 * aplicación. Quien necesite dibujar otra cosa —un campo para escribirlo, por
 * ejemplo— mira `price === null` y decide.
 */
export const formatServiceMoney = (
	value: number | null,
	currency: string,
): string =>
	value === null ? QUOTED_PRICE_LABEL : formatMoney(value, currency);

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
 *
 * Lo que no tiene precio no entra —no como cero, que lo daría por cobrado en
 * cero—, así que una cita de un solo servicio que se cotiza devuelve lista vacía.
 * Quien la muestre tiene que decir que falta un precio; ver `formatTotals`.
 */
export const sumByCurrency = (
	items: Iterable<{ price: number | null; currency: string }>,
): MoneyTotal[] => {
	const totals = new Map<string, number>();

	for (const item of items) {
		if (item.price === null) continue;

		totals.set(item.currency, (totals.get(item.currency) ?? 0) + item.price);
	}

	return [...totals]
		.map(([currency, amount]) => ({ currency, amount }))
		.sort(
			(a, b) => b.amount - a.amount || a.currency.localeCompare(b.currency),
		);
};

/**
 * Cuántos de esos tramos todavía no tienen precio.
 *
 * Va con `sumByCurrency`: uno dice cuánto hay y el otro cuánto falta, y sin los
 * dos el total de una cita con un servicio sin cotizar se lee como el total
 * final. Ver `formatTotals`.
 */
export const countUnpriced = (
	items: Iterable<{ price: number | null }>,
): number => {
	let unpriced = 0;
	for (const item of items) if (item.price === null) unpriced += 1;
	return unpriced;
};

/**
 * Varios importes escritos uno al lado del otro: `Bs 400 + USD 40`.
 *
 * El separador es un `+` y no una coma porque no son alternativas ni una lista:
 * son dos partes de un mismo total que no se pueden sumar. Sin importes se
 * devuelve un cero en la moneda que indique quien llama, que sabe cuál
 * corresponde.
 *
 * `unpriced` son los tramos que todavía no tienen precio, y se cuentan en vez de
 * sumarse: el total de una cita con una coloración sin cotizar no es lo que ya
 * hay, es lo que ya hay **más algo**. Sin esto, la misma cita mostraba "Bs 80" y
 * el negocio cobraba otra cosa. Cuando no hay ningún importe, el total no es
 * cero: es que no se sabe.
 */
export const formatTotals = (
	totals: MoneyTotal[],
	fallbackCurrency: string,
	unpriced = 0,
): string => {
	const amounts = totals.map((total) =>
		formatMoney(total.amount, total.currency),
	);

	if (unpriced > 0) {
		amounts.push(unpriced === 1 ? '1 sin precio' : `${unpriced} sin precio`);
	}

	return amounts.length === 0
		? formatMoney(0, fallbackCurrency)
		: amounts.join(' + ');
};
