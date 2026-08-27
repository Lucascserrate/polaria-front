/**
 * La paleta con la que se distingue a cada miembro del equipo.
 *
 * El backend guarda un **token** (`blue`, `blood-orange`) y valida que esté en la
 * lista; acá viven los valores. Un hexadecimal en la base congelaría la paleta: el
 * día que se ajuste un tono, quien lo tenía guardado se quedaría con el anterior.
 *
 * El orden no es alfabético y no debe ordenarse: recorre el círculo de tonos, del
 * celeste al cian pasando por los violetas, los cálidos y los verdes. Es lo que
 * hace que el selector se lea como un espectro y no como una bolsa de colores.
 *
 * Los tonos son medios y de saturación pareja a propósito: van a convivir en una
 * misma pantalla —una columna por profesional— y una paleta con un color estridente
 * al lado de uno apagado hace que la agenda parezca destacar a alguien.
 */

export const TEAM_COLORS = [
	'blue',
	'dark-blue',
	'jordy-blue',
	'indigo',
	'lavender',
	'wisteria',
	'pink',
	'coral',
	'blood-orange',
	'orange',
	'amber',
	'yellow',
	'lime',
	'green',
	'teal',
	'cyan',
] as const;

export type TeamColor = (typeof TEAM_COLORS)[number];

const HEX: Record<TeamColor, string> = {
	blue: '#61b4d2',
	'dark-blue': '#609cd1',
	'jordy-blue': '#6792e0',
	indigo: '#8792e5',
	lavender: '#a887e5',
	wisteria: '#d08ee5',
	pink: '#e58ed3',
	coral: '#f294ac',
	'blood-orange': '#d98b60',
	orange: '#e6a04d',
	amber: '#f0b74d',
	yellow: '#e6d159',
	lime: '#dde659',
	green: '#5bc682',
	teal: '#59c2b8',
	cyan: '#59bbc2',
};

export const TEAM_COLOR_LABELS: Record<TeamColor, string> = {
	blue: 'Celeste',
	'dark-blue': 'Azul',
	'jordy-blue': 'Azul intenso',
	indigo: 'Índigo',
	lavender: 'Lavanda',
	wisteria: 'Lila',
	pink: 'Rosa',
	coral: 'Coral',
	'blood-orange': 'Terracota',
	orange: 'Naranja',
	amber: 'Ámbar',
	yellow: 'Amarillo',
	lime: 'Lima',
	green: 'Verde',
	teal: 'Verde agua',
	cyan: 'Cian',
};

/**
 * Todo lo que hace falta para pintar con un color de la paleta.
 *
 * Son cinco valores y no uno porque el color aparece de dos formas distintas: como
 * relleno —el avatar, la muestra del selector— y como fondo tenue con texto encima
 * —el bloque de una cita en la agenda—. Y la segunda necesita un texto distinto en
 * cada tema, porque el mismo tinte queda claro sobre fondo blanco y oscuro sobre
 * fondo negro.
 */
export interface TeamColorScheme {
	/** El color, tal cual. */
	hex: string;
	/** Texto legible **sobre** `hex`. */
	on: string;
	/** Fondo tenue. Al ser translúcido funciona en los dos temas. */
	tint: string;
	/** Texto sobre `tint` en tema claro. */
	strong: string;
	/** Texto sobre `tint` en tema oscuro. */
	soft: string;
}

const rgbOf = (hex: string): [number, number, number] => [
	parseInt(hex.slice(1, 3), 16),
	parseInt(hex.slice(3, 5), 16),
	parseInt(hex.slice(5, 7), 16),
];

const toHex = (channel: number) =>
	Math.round(Math.min(255, Math.max(0, channel)))
		.toString(16)
		.padStart(2, '0');

const mix = (hex: string, toward: [number, number, number], amount: number) => {
	const [r, g, b] = rgbOf(hex);
	const blend = (channel: number, target: number) =>
		channel * (1 - amount) + target * amount;

	return `#${toHex(blend(r, toward[0]))}${toHex(blend(g, toward[1]))}${toHex(blend(b, toward[2]))}`;
};

const BLACK: [number, number, number] = [0, 0, 0];
const WHITE: [number, number, number] = [255, 255, 255];

export const luminanceOf = (hex: string): number => {
	const channels = rgbOf(hex).map((channel) => {
		const ratio = channel / 255;
		return ratio <= 0.03928
			? ratio / 12.92
			: Math.pow((ratio + 0.055) / 1.055, 2.4);
	});

	return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

export const contrastRatio = (a: string, b: string): number => {
	const light = Math.max(luminanceOf(a), luminanceOf(b));
	const dark = Math.min(luminanceOf(a), luminanceOf(b));
	return (light + 0.05) / (dark + 0.05);
};

export const PAPER = '#ffffff';
export const INK = '#18181b';

/**
 * Las iniciales del avatar van en blanco, en toda la paleta.
 *
 * Es una decisión tomada mirando la pantalla, no calculada, y conviene dejar
 * anotado en contra qué: **ningún color de la paleta pasa AA con blanco**. El
 * mejor es `jordy-blue` con 3.10 y el peor `lime` con 1.35; con tinta oscura los
 * dieciséis pasan holgados. Para que el blanco diera 4.5 habría que oscurecer los
 * rellenos entre 19% y 47%, y a esa altura `yellow` es marrón: se perdería la
 * paleta para ganar un número.
 *
 * Se elige el blanco igual porque lo que hay encima no es información: el avatar
 * lleva `aria-hidden`, nunca aparece sin el nombre completo al lado, y quien no
 * distinga las iniciales lee el nombre —que sí tiene contraste pleno—. Sirve para
 * reconocer de un golpe de vista, y en eso el blanco gana.
 *
 * Lo que **sí** es información son `strong` y `soft`, el texto de una cita sobre
 * su fondo tenue. Esos dos están calculados para cumplir AA y hay tests que lo
 * exigen.
 */
export const ON_FILL = PAPER;

const SCHEMES: Record<TeamColor, TeamColorScheme> = Object.fromEntries(
	TEAM_COLORS.map((color) => {
		const hex = HEX[color];

		return [
			color,
			{
				hex,
				on: ON_FILL,
				tint: `${hex}24`,
				strong: mix(hex, BLACK, 0.5),
				soft: mix(hex, WHITE, 0.3),
			},
		];
	}),
) as Record<TeamColor, TeamColorScheme>;

export const schemeOf = (color: TeamColor): TeamColorScheme => SCHEMES[color];

const isTeamColor = (value: string): value is TeamColor =>
	(TEAM_COLORS as readonly string[]).includes(value);

const hashOf = (seed: string): number => {
	let hash = 0;
	for (let index = 0; index < seed.length; index += 1) {
		hash = (hash * 31 + seed.charCodeAt(index)) % 100_000;
	}
	return hash;
};

/**
 * El color de alguien: el que eligió, o el que le toca.
 *
 * Se deriva del id y no se sortea, porque quien no eligió color tiene que ser
 * siempre del mismo o cambiaría en cada carga de la agenda. Es la misma cuenta que
 * hace `fallbackCalendarColor` en el servidor.
 *
 * Un token que ya no esté en la paleta cae al derivado en lugar de dejar a la
 * persona sin color: así se puede sacar un color de la lista sin migrar nada.
 */
export const colorOf = (member: {
	id?: string;
	calendarColor?: string | null;
}): TeamColor => {
	const chosen = member.calendarColor;
	if (chosen && isTeamColor(chosen)) return chosen;

	return TEAM_COLORS[hashOf(member.id ?? '') % TEAM_COLORS.length];
};

export const schemeFor = (member: {
	id?: string;
	calendarColor?: string | null;
}): TeamColorScheme => schemeOf(colorOf(member));

/**
 * El relleno sólido con su texto encima: avatares y muestras del selector.
 *
 * La sombra viene incluida porque el blanco sobre estos tonos la necesita para
 * tener borde, y dejarla afuera la haría opcional: cada consumidor nuevo tendría
 * que acordarse de agregarla, y el que se olvidara no vería que quedó mal —vería
 * que quedó un poco flojo.
 */
export const fillStyleOf = (color: TeamColor): React.CSSProperties => ({
	backgroundColor: schemeOf(color).hex,
	color: schemeOf(color).on,
});
