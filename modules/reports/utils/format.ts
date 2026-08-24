export { formatMoney } from '@/lib/money';

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
