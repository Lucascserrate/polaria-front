/**
 * Los países y su prefijo telefónico.
 *
 * Sólo se escriben a mano dos cosas por país: su código ISO y su prefijo. El
 * nombre y la bandera se derivan —`Intl.DisplayNames` para el nombre en
 * castellano, los indicadores regionales Unicode para la bandera— y eso no es
 * una economía de tipeo: doscientos cuarenta nombres escritos a mano son
 * doscientas cuarenta oportunidades de una tilde mal puesta que nadie va a
 * revisar, y encima quedarían en un solo idioma para siempre.
 *
 * Existe porque el prefijo dejó de adivinarse. Antes el teléfono se escribía
 * suelto y el backend le anteponía el del negocio salvo que "pareciera" traer
 * país —lo detectaba mirando si los dígitos empezaban con el prefijo local—, y
 * esa heurística falla justo donde más duele: en un negocio argentino, un número
 * local que arranca con 54 se leía como si ya tuviera país. El teléfono quedaba
 * mal guardado y nadie se enteraba hasta que el recordatorio no llegaba.
 */

/**
 * `[ISO 3166-1 alfa-2, prefijo sin +]`.
 *
 * Los territorios que comparten prefijo con su país —Jersey con el Reino Unido,
 * el Vaticano con Italia— van igual: se eligen por nombre, y que dos filas
 * terminen en el mismo `+44` no molesta a nadie.
 */
const DIAL_CODES: ReadonlyArray<readonly [string, string]> = [
	['AD', '376'],
	['AE', '971'],
	['AF', '93'],
	['AG', '1268'],
	['AI', '1264'],
	['AL', '355'],
	['AM', '374'],
	['AO', '244'],
	['AR', '54'],
	['AS', '1684'],
	['AT', '43'],
	['AU', '61'],
	['AW', '297'],
	['AX', '358'],
	['AZ', '994'],
	['BA', '387'],
	['BB', '1246'],
	['BD', '880'],
	['BE', '32'],
	['BF', '226'],
	['BG', '359'],
	['BH', '973'],
	['BI', '257'],
	['BJ', '229'],
	['BL', '590'],
	['BM', '1441'],
	['BN', '673'],
	['BO', '591'],
	['BQ', '599'],
	['BR', '55'],
	['BS', '1242'],
	['BT', '975'],
	['BW', '267'],
	['BY', '375'],
	['BZ', '501'],
	['CA', '1'],
	['CD', '243'],
	['CF', '236'],
	['CG', '242'],
	['CH', '41'],
	['CI', '225'],
	['CK', '682'],
	['CL', '56'],
	['CM', '237'],
	['CN', '86'],
	['CO', '57'],
	['CR', '506'],
	['CU', '53'],
	['CV', '238'],
	['CW', '599'],
	['CY', '357'],
	['CZ', '420'],
	['DE', '49'],
	['DJ', '253'],
	['DK', '45'],
	['DM', '1767'],
	['DO', '1809'],
	['DZ', '213'],
	['EC', '593'],
	['EE', '372'],
	['EG', '20'],
	['EH', '212'],
	['ER', '291'],
	['ES', '34'],
	['ET', '251'],
	['FI', '358'],
	['FJ', '679'],
	['FK', '500'],
	['FM', '691'],
	['FO', '298'],
	['FR', '33'],
	['GA', '241'],
	['GB', '44'],
	['GD', '1473'],
	['GE', '995'],
	['GF', '594'],
	['GG', '44'],
	['GH', '233'],
	['GI', '350'],
	['GL', '299'],
	['GM', '220'],
	['GN', '224'],
	['GP', '590'],
	['GQ', '240'],
	['GR', '30'],
	['GT', '502'],
	['GU', '1671'],
	['GW', '245'],
	['GY', '592'],
	['HK', '852'],
	['HN', '504'],
	['HR', '385'],
	['HT', '509'],
	['HU', '36'],
	['ID', '62'],
	['IE', '353'],
	['IL', '972'],
	['IM', '44'],
	['IN', '91'],
	['IQ', '964'],
	['IR', '98'],
	['IS', '354'],
	['IT', '39'],
	['JE', '44'],
	['JM', '1876'],
	['JO', '962'],
	['JP', '81'],
	['KE', '254'],
	['KG', '996'],
	['KH', '855'],
	['KI', '686'],
	['KM', '269'],
	['KN', '1869'],
	['KP', '850'],
	['KR', '82'],
	['KW', '965'],
	['KY', '1345'],
	['KZ', '7'],
	['LA', '856'],
	['LB', '961'],
	['LC', '1758'],
	['LI', '423'],
	['LK', '94'],
	['LR', '231'],
	['LS', '266'],
	['LT', '370'],
	['LU', '352'],
	['LV', '371'],
	['LY', '218'],
	['MA', '212'],
	['MC', '377'],
	['MD', '373'],
	['ME', '382'],
	['MF', '590'],
	['MG', '261'],
	['MH', '692'],
	['MK', '389'],
	['ML', '223'],
	['MM', '95'],
	['MN', '976'],
	['MO', '853'],
	['MP', '1670'],
	['MQ', '596'],
	['MR', '222'],
	['MS', '1664'],
	['MT', '356'],
	['MU', '230'],
	['MV', '960'],
	['MW', '265'],
	['MX', '52'],
	['MY', '60'],
	['MZ', '258'],
	['NA', '264'],
	['NC', '687'],
	['NE', '227'],
	['NG', '234'],
	['NI', '505'],
	['NL', '31'],
	['NO', '47'],
	['NP', '977'],
	['NR', '674'],
	['NU', '683'],
	['NZ', '64'],
	['OM', '968'],
	['PA', '507'],
	['PE', '51'],
	['PF', '689'],
	['PG', '675'],
	['PH', '63'],
	['PK', '92'],
	['PL', '48'],
	['PM', '508'],
	['PR', '1787'],
	['PS', '970'],
	['PT', '351'],
	['PW', '680'],
	['PY', '595'],
	['QA', '974'],
	['RE', '262'],
	['RO', '40'],
	['RS', '381'],
	['RU', '7'],
	['RW', '250'],
	['SA', '966'],
	['SB', '677'],
	['SC', '248'],
	['SD', '249'],
	['SE', '46'],
	['SG', '65'],
	['SH', '290'],
	['SI', '386'],
	['SK', '421'],
	['SL', '232'],
	['SM', '378'],
	['SN', '221'],
	['SO', '252'],
	['SR', '597'],
	['SS', '211'],
	['ST', '239'],
	['SV', '503'],
	['SX', '1721'],
	['SY', '963'],
	['SZ', '268'],
	['TC', '1649'],
	['TD', '235'],
	['TG', '228'],
	['TH', '66'],
	['TJ', '992'],
	['TL', '670'],
	['TM', '993'],
	['TN', '216'],
	['TO', '676'],
	['TR', '90'],
	['TT', '1868'],
	['TV', '688'],
	['TW', '886'],
	['TZ', '255'],
	['UA', '380'],
	['UG', '256'],
	['US', '1'],
	['UY', '598'],
	['UZ', '998'],
	['VA', '39'],
	['VC', '1784'],
	['VE', '58'],
	['VG', '1284'],
	['VI', '1340'],
	['VN', '84'],
	['VU', '678'],
	['WS', '685'],
	['YE', '967'],
	['YT', '262'],
	['ZA', '27'],
	['ZM', '260'],
	['ZW', '263'],
];

/**
 * Qué país representa a un prefijo compartido.
 *
 * Hace falta al revés: un número guardado trae dígitos, no un país, y `+1` puede
 * ser una decena de lugares. Se elige el más probable en lugar de tomar el
 * primero de la lista, que en castellano dejaría `+1` como Canadá y `+44` como
 * Guernesey.
 *
 * Es sólo para la bandera que se muestra. El número no depende de esto: se
 * guarda con sus dígitos intactos, elija lo que elija.
 */
const PRIMARY_BY_DIAL: Record<string, string> = {
	'1': 'US',
	'7': 'RU',
	'39': 'IT',
	'44': 'GB',
	'47': 'NO',
	'61': 'AU',
	'212': 'MA',
	'262': 'RE',
	'358': 'FI',
	'590': 'GP',
	'594': 'GF',
	'599': 'CW',
};

export interface Country {
	/** ISO 3166-1 alfa-2. */
	iso: string;
	/** El prefijo, sin `+`. */
	dial: string;
	name: string;
	flag: string;
}

/**
 * La bandera a partir del código ISO.
 *
 * Las banderas de país no son caracteres propios: son dos indicadores
 * regionales, uno por letra, que el sistema dibuja junto. Por eso salen de
 * correr el código y no de una tabla de emojis escrita a mano.
 */
const flagOf = (iso: string): string =>
	String.fromCodePoint(
		...[...iso].map((letter) => 0x1f1e6 + letter.charCodeAt(0) - 65),
	);

/**
 * El nombre del país en castellano, según el navegador.
 *
 * Con el `Intl` recortado —algún runtime sin datos de idioma— se cae al código
 * ISO. Es feo y es buscable, que es lo único que esta pantalla necesita para
 * seguir siendo usable.
 */
const nameOf = (() => {
	try {
		const display = new Intl.DisplayNames(['es'], { type: 'region' });
		return (iso: string) => display.of(iso) ?? iso;
	} catch {
		return (iso: string) => iso;
	}
})();

/** Todos los países, ordenados por nombre como se ordena en castellano. */
export const COUNTRIES: Country[] = DIAL_CODES.map(([iso, dial]) => ({
	iso,
	dial,
	name: nameOf(iso),
	flag: flagOf(iso),
})).sort((a, b) => a.name.localeCompare(b.name, 'es'));

const BY_ISO = new Map(COUNTRIES.map((country) => [country.iso, country]));

/** El país que representa a un prefijo, para mostrar su bandera. */
export const countryForDial = (dial: string): Country | null => {
	const primary = PRIMARY_BY_DIAL[dial];
	if (primary) return BY_ISO.get(primary) ?? null;

	return COUNTRIES.find((country) => country.dial === dial) ?? null;
};

/**
 * Los prefijos de más largo a más corto, que es el orden en que hay que
 * probarlos: `1868` es Trinidad y `1` es Estados Unidos, y quien pruebe `1`
 * primero se lleva puesto al otro.
 */
const DIALS_BY_LENGTH = [...new Set(COUNTRIES.map((c) => c.dial))].sort(
	(a, b) => b.length - a.length,
);

export interface SplitPhone {
	/** El prefijo reconocido, o `''` si ninguno coincide. */
	dial: string;
	/** El resto del número. Con `dial` vacío, son todos los dígitos. */
	national: string;
}

/**
 * Parte un número guardado en prefijo y número nacional.
 *
 * Sin coincidencia devuelve el número entero como nacional y el prefijo vacío,
 * en lugar de suponerle uno. Es lo que evita que abrir la ficha de un cliente
 * con el teléfono corrupto lo "arregle" anteponiéndole un país inventado y lo
 * guarde así: los dígitos vuelven a salir tal como entraron, y quien edita ve
 * que falta elegir el país.
 */
export const splitPhone = (raw: string): SplitPhone => {
	const digits = raw.replace(/\D/g, '');
	if (!digits) return { dial: '', national: '' };

	const dial = DIALS_BY_LENGTH.find((candidate) =>
		digits.startsWith(candidate),
	);

	return dial
		? { dial, national: digits.slice(dial.length) }
		: { dial: '', national: digits };
};

/**
 * Sin tildes y en minúscula, para comparar.
 *
 * Los nombres salen de `Intl` bien escritos —"Perú", "Panamá"— y nadie los
 * escribe así en un buscador. Sin esto, tipear "peru" no encuentra Perú, que es
 * la forma más rápida de que una búsqueda parezca rota.
 */
const fold = (text: string): string =>
	text
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase();

/** El nombre ya plegado de cada país: se calcula una vez, no en cada tecla. */
const SEARCH_INDEX = COUNTRIES.map((country) => ({
	country,
	folded: fold(country.name),
}));

/**
 * Los países que coinciden con lo escrito, por nombre o por prefijo.
 *
 * Las dos formas porque son dos maneras de saber lo mismo: quien tiene presente
 * el "+54" no tiene por qué acordarse de cómo se escribe el país, y al revés.
 *
 * El prefijo sólo se compara cuando se escribieron dígitos. Es la parte que
 * parece de más y no lo es: `'54'.startsWith('')` es cierto, así que con un
 * término sin números la condición daba verdadero para los doscientos países y
 * la búsqueda por nombre no filtraba absolutamente nada.
 */
export const searchCountries = (term: string): Country[] => {
	const trimmed = term.trim();
	if (!trimmed) return COUNTRIES;

	const text = fold(trimmed);
	const digits = trimmed.replace(/\D/g, '');

	return SEARCH_INDEX.filter(
		({ country, folded }) =>
			folded.includes(text) ||
			(digits !== '' && country.dial.startsWith(digits)),
	).map(({ country }) => country);
};
