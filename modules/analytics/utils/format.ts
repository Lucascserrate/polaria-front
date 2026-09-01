import type { ReportPreset } from '@/types/reports.types';

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

/** `2026-08-09` → `agosto`. En español el mes va en minúscula. */
export const formatMonth = (isoDate: string): string => {
	const [year, month] = isoDate.split('-').map(Number);
	return new Intl.DateTimeFormat('es-BO', {
		month: 'long',
		timeZone: 'UTC',
	}).format(new Date(Date.UTC(year, month - 1, 1)));
};

const capitalize = (text: string): string =>
	text.charAt(0).toUpperCase() + text.slice(1);

/**
 * Cómo se llama el período que se está mirando.
 *
 * Los presets se nombran, no se escriben como fechas: "Agosto" ubica mejor que
 * "1 ago 2026 – 31 ago 2026", que además es demasiado largo para el encabezado de
 * una tarjeta en un teléfono. El rango a medida sí va con fechas, porque no tiene
 * otro nombre.
 */
export const periodLabel = (
	preset: ReportPreset,
	range: { from: string; to: string },
): string => {
	switch (preset) {
		case 'today':
			return 'Hoy';
		case 'week':
			return 'Esta semana';
		case 'month':
			return capitalize(formatMonth(range.from));
		case 'custom':
			return formatRange(range.from, range.to);
	}
};

/**
 * Cómo se nombra el período anterior dentro de un "vs. …".
 *
 * Va en minúscula y sin artículo donde el nombre ya alcanza ("vs. julio"), y con
 * artículo donde hace falta para que se lea como español ("vs. la semana
 * pasada").
 */
export const comparisonLabel = (
	preset: ReportPreset,
	range: { from: string; to: string },
): string => {
	switch (preset) {
		case 'today':
			return 'ayer';
		case 'week':
			return 'la semana pasada';
		case 'month':
			return formatMonth(range.from);
		case 'custom':
			return formatRange(range.from, range.to);
	}
};
