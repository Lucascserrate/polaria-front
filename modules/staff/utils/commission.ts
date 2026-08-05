/**
 * La comisión viaja como el `decimal` de MySQL, que el backend serializa como
 * string ("40.00"). Estas dos funciones son el único lugar que necesita saberlo.
 */

/** `null` significa que el negocio no configuró comisión, distinto de `0`. */
export const parseCommissionRate = (
	value: number | string | null | undefined,
): number | null => {
	if (value === null || value === undefined || value === '') return null;
	const rate = Number(value);
	return Number.isFinite(rate) ? rate : null;
};

export const formatCommissionRate = (
	value: number | string | null | undefined,
): string => {
	const rate = parseCommissionRate(value);
	return rate === null ? 'Sin comisión' : `${rate}%`;
};

/** Valor inicial del input: "40.00" se muestra como "40". */
export const toCommissionInput = (
	value: number | string | null | undefined,
): string => {
	const rate = parseCommissionRate(value);
	return rate === null ? '' : String(rate);
};
