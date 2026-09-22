import type {
	ImportRowApi,
	ImportSkipReason,
} from '@/types/clients-import.types';

/**
 * Por qué se omite una fila, en palabras del negocio.
 *
 * Cada motivo dice qué hacer, no qué falló: "Sin teléfono" se arregla en la
 * agenda del teléfono, "Ya está dado de baja" se arregla en Polaria, y
 * "Repetido en el archivo" no se arregla porque no hay nada roto. Un "error de
 * validación" genérico dejaría al negocio con veinte filas y ninguna pista.
 */
export const SKIP_REASONS: Record<ImportSkipReason, string> = {
	no_phone: 'Sin teléfono',
	invalid_phone: 'Teléfono ilegible',
	repeated_in_file: 'Repetido en el archivo',
	deleted: 'Dado de baja en Polaria',
};

/** Qué campo se completaría, para decirlo en la fila. */
const FILL_LABELS: Record<string, string> = {
	name: 'el nombre',
	email: 'el email',
};

/**
 * El estado de una fila, listo para mostrar.
 *
 * Al cliente que ya existe se le agrega qué se le completaría, porque es la
 * única diferencia visible entre "no pasa nada con esta fila" y "esta fila suma
 * un dato". Sin eso, la casilla de completar datos sería una promesa sin
 * evidencia.
 */
export const rowLabel = (row: ImportRowApi, fillMissing: boolean): string => {
	if (row.status === 'new') return 'Nuevo';

	if (row.status === 'skipped') {
		return row.reason ? SKIP_REASONS[row.reason] : 'Omitido';
	}

	if (fillMissing && row.fills.length > 0) {
		const campos = row.fills
			.map((field) => FILL_LABELS[field] ?? field)
			.join(' y ');

		return `Ya existe · se completa ${campos}`;
	}

	return 'Ya existe';
};
