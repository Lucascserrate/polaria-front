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
