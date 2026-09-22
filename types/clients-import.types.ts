/**
 * La importación de contactos, tal como la describe el backend.
 *
 * Vive en su propio archivo y no junto a `ClientApi` porque nada de esto es un
 * cliente: son filas de un archivo con un pronóstico encima —qué pasaría si se
 * confirma— y sólo existen entre que se sube el CSV y que se aprieta importar.
 */

/** Qué columna del archivo alimenta cada campo. */
export interface ImportMappingApi {
	/** Se concatenan en orden: el modelo tiene un solo `name`. */
	nameColumns: string[];
	/** Se usa la primera que traiga algo en cada fila. */
	phoneColumns: string[];
	emailColumns: string[];
}

export type ImportRowStatus = 'new' | 'existing' | 'skipped';

/** Por qué se omite una fila. La pantalla lo traduce a una frase. */
export type ImportSkipReason =
	'no_phone' | 'invalid_phone' | 'repeated_in_file' | 'deleted';

export type ImportFillableField = 'name' | 'email';

export interface ImportRowApi {
	/** Fila del archivo sin contar el encabezado, para poder ir a buscarla. */
	row: number;
	name: string | null;
	/**
	 * Ya normalizado al formato de Polaria. Con `reason: 'invalid_phone'` trae lo
	 * que decía el archivo, que es lo único con lo que se encuentra esa fila.
	 */
	phone: string | null;
	email: string | null;
	status: ImportRowStatus;
	reason?: ImportSkipReason;
	/** El cliente que ya existía, cuando lo hay y está activo. */
	clientId: string | null;
	/** Campos vacíos que la importación completaría si la casilla está marcada. */
	fills: ImportFillableField[];
}

export interface ImportAnalysisApi {
	/** Los encabezados del archivo, para poder corregir el mapeo a mano. */
	headers: string[];
	mapping: ImportMappingApi;
	/** El prefijo con el que se completaron los números sin país. */
	dialCode: string;
	total: number;
	counts: { toCreate: number; existing: number; skipped: number };
	rows: ImportRowApi[];
}

export interface ImportResultApi extends ImportAnalysisApi {
	/** Fichas creadas de verdad. */
	created: number;
	/** Clientes existentes a los que se les completó algún campo vacío. */
	completed: number;
}
