/**
 * Montos en la moneda del negocio, que viaja en cada reporte. Sin decimales:
 * en una barbería los precios son redondos y los centavos solo hacen ruido.
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

/** `2026-08-09` → `9 ago 2026`, para el encabezado del período. */
export const formatDay = (isoDate: string): string => {
	const [year, month, day] = isoDate.split('-').map(Number);
	return new Intl.DateTimeFormat('es-BO', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC',
	}).format(new Date(Date.UTC(year, month - 1, day)));
};

export const formatRange = (from: string, to: string): string =>
	from === to ? formatDay(from) : `${formatDay(from)} – ${formatDay(to)}`;
