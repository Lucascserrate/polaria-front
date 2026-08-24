/**
 * Cómo se escribe la plata en el panel.
 *
 * Sin decimales a propósito: los precios de un servicio son redondos —100, 40,
 * 25— y mostrar `100.00` agrega ruido en cada fila sin agregar información. Si
 * algún día hay centavos de verdad, es acá donde se decide, en un solo lugar.
 */
export const formatMoney = (value: number, currency: string): string => {
	try {
		return new Intl.NumberFormat('es-BO', {
			style: 'currency',
			currency,
			maximumFractionDigits: 0,
		}).format(value);
	} catch {
		// Un código de moneda inválido no debería tumbar la pantalla entera.
		return `${currency} ${Math.round(value)}`;
	}
};
