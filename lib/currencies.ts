/**
 * Las monedas que Polaria sabe escribir, con su nombre y su locale.
 *
 * Los códigos son los mismos que valida el servidor en `CURRENCIES`. Son dos
 * listas y no una porque el panel necesita además la etiqueta que lee una
 * persona, igual que pasa con los rubros (`BUSINESS_TYPES` allá,
 * `BUSINESS_TYPE_OPTIONS` acá): el código es el dato, el texto es interfaz.
 *
 * El locale no es decorativo: el símbolo lo elige el locale, no la moneda. Con
 * `es-BO` un precio en pesos colombianos se imprime "COP 45.000"; con `es-CO`,
 * "$ 45.000". Formatear cada moneda con el locale de su país es lo que hace que
 * el precio se vea como el cliente espera.
 */
export interface CurrencyOption {
	code: string;
	label: string;
	locale: string;
}

export const CURRENCY_OPTIONS: readonly CurrencyOption[] = [
	{ code: 'ARS', label: 'Peso argentino', locale: 'es-AR' },
	{ code: 'BOB', label: 'Boliviano', locale: 'es-BO' },
	{ code: 'BRL', label: 'Real brasileño', locale: 'pt-BR' },
	{ code: 'CLP', label: 'Peso chileno', locale: 'es-CL' },
	{ code: 'COP', label: 'Peso colombiano', locale: 'es-CO' },
	{ code: 'CRC', label: 'Colón costarricense', locale: 'es-CR' },
	{ code: 'DOP', label: 'Peso dominicano', locale: 'es-DO' },
	{ code: 'EUR', label: 'Euro', locale: 'es-ES' },
	{ code: 'GTQ', label: 'Quetzal', locale: 'es-GT' },
	{ code: 'HNL', label: 'Lempira', locale: 'es-HN' },
	{ code: 'MXN', label: 'Peso mexicano', locale: 'es-MX' },
	{ code: 'NIO', label: 'Córdoba', locale: 'es-NI' },
	{ code: 'PEN', label: 'Sol', locale: 'es-PE' },
	{ code: 'PYG', label: 'Guaraní', locale: 'es-PY' },
	{ code: 'USD', label: 'Dólar estadounidense', locale: 'en-US' },
	{ code: 'UYU', label: 'Peso uruguayo', locale: 'es-UY' },
	{ code: 'VES', label: 'Bolívar', locale: 'es-VE' },
];

/** Moneda del negocio cuando todavía no llegó la configuración. */
export const DEFAULT_CURRENCY = 'BOB';

/**
 * El locale con el que se escribe esa moneda.
 *
 * Una moneda que no está en la lista cae a `es`, que imprime el código en vez
 * del símbolo. Es feo pero legible, y no puede pasar por el panel: la lista está
 * cerrada de los dos lados.
 */
export const localeForCurrency = (currency: string): string =>
	CURRENCY_OPTIONS.find((option) => option.code === currency)?.locale ?? 'es';

/** El nombre de la moneda, o el código si no la conocemos. */
export const currencyLabel = (currency: string): string =>
	CURRENCY_OPTIONS.find((option) => option.code === currency)?.label ??
	currency;
