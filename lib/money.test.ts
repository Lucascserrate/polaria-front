import { describe, expect, it } from 'vitest';
import {
	countUnpriced,
	formatMoney,
	formatServiceMoney,
	formatTotals,
	QUOTED_PRICE_LABEL,
	sumByCurrency,
	toPrice,
} from './money';
import {
	CURRENCY_OPTIONS,
	currencyLabel,
	localeForCurrency,
} from './currencies';

describe('formatMoney', () => {
	it('usa el símbolo del país de la moneda y no el del negocio que la mira', () => {
		// El locale estaba fijo en `es-BO`, y con eso un negocio colombiano leía
		// "COP 45.000" en cada precio en vez de "$ 45.000".
		expect(formatMoney(45_000, 'COP')).not.toContain('COP');
		expect(formatMoney(80, 'BOB')).toContain('Bs');
	});

	it('no muestra centavos', () => {
		expect(formatMoney(79.6, 'BOB')).not.toContain(',6');
	});

	it('devuelve algo legible con una moneda que no existe', () => {
		expect(formatMoney(100, 'XXXXX')).toBe('XXXXX 100');
	});
});

describe('catálogo de monedas', () => {
	it('da un locale a cada moneda ofrecida', () => {
		// Sin locale propio el precio sale con el código en vez del símbolo, que es
		// exactamente el problema que el selector viene a resolver.
		for (const option of CURRENCY_OPTIONS) {
			expect(localeForCurrency(option.code)).toBe(option.locale);
		}
	});

	it('cae al código cuando la moneda no está en la lista', () => {
		expect(currencyLabel('JPY')).toBe('JPY');
		expect(localeForCurrency('JPY')).toBe('es');
	});
});

describe('sumByCurrency', () => {
	it('suma cada moneda por separado en vez de mezclarlas', () => {
		// 300 bolivianos más 40 dólares no son 340 de nada.
		expect(
			sumByCurrency([
				{ price: 300, currency: 'BOB' },
				{ price: 40, currency: 'USD' },
				{ price: 100, currency: 'BOB' },
			]),
		).toEqual([
			{ currency: 'BOB', amount: 400 },
			{ currency: 'USD', amount: 40 },
		]);
	});

	it('devuelve una sola entrada cuando el catálogo cobra en una moneda', () => {
		// El caso de casi todos: la pantalla se dibuja igual que antes.
		expect(sumByCurrency([{ price: 50, currency: 'BOB' }])).toHaveLength(1);
	});

	it('sin importes devuelve vacío y no un cero sin moneda', () => {
		expect(sumByCurrency([])).toEqual([]);
	});
});

describe('formatTotals', () => {
	it('escribe las monedas con un más, que no es una suma', () => {
		// El `+` separa dos totales que no se pueden sumar, no los suma. No se
		// compara la cadena entera porque `Intl` mete espacios duros propios.
		const written = formatTotals(
			[
				{ currency: 'BOB', amount: 400 },
				{ currency: 'USD', amount: 40 },
			],
			'BOB',
		);

		expect(written).toBe(
			`${formatMoney(400, 'BOB')} + ${formatMoney(40, 'USD')}`,
		);
		expect(written).toContain('400');
		expect(written).toContain('40');
	});

	it('sin nada escribe el cero en la moneda que le indiquen', () => {
		// "No facturó" no tiene moneda propia, pero un cero pelado no se lee.
		expect(formatTotals([], 'BOB')).toBe(formatMoney(0, 'BOB'));
	});

	it('lo que falta cotizar se cuenta al lado del total', () => {
		expect(formatTotals([{ currency: 'BOB', amount: 80 }], 'BOB', 1)).toBe(
			`${formatMoney(80, 'BOB')} + 1 sin precio`,
		);
	});

	it('sin ningún importe el total no es cero: es que no se sabe', () => {
		expect(formatTotals([], 'BOB', 2)).toBe('2 sin precio');
	});
});

describe('sumByCurrency con precios ausentes', () => {
	it('lo que no tiene precio no suma como cero', () => {
		expect(
			sumByCurrency([
				{ price: 50, currency: 'BOB' },
				{ price: null, currency: 'BOB' },
			]),
		).toEqual([{ currency: 'BOB', amount: 50 }]);
	});
});

describe('countUnpriced', () => {
	it('cuenta los tramos sin precio, no los de precio cero', () => {
		expect(countUnpriced([{ price: 0 }, { price: null }, { price: 30 }])).toBe(
			1,
		);
	});
});

describe('formatServiceMoney', () => {
	it('escribe el aviso donde no hay importe', () => {
		expect(formatServiceMoney(null, 'BOB')).toBe(QUOTED_PRICE_LABEL);
	});

	it('el cero es un precio: gratis, no a cotizar', () => {
		expect(formatServiceMoney(0, 'BOB')).toBe(formatMoney(0, 'BOB'));
	});
});

describe('toPrice', () => {
	it('no convierte la ausencia de precio en cero', () => {
		// `Number(null)` da 0, y ese cero se muestra como un servicio gratis.
		expect(toPrice(null)).toBeNull();
		expect(toPrice(undefined)).toBeNull();
	});

	it('acepta el string que devuelve MySQL para las columnas decimal', () => {
		expect(toPrice('100.00')).toBe(100);
	});

	it('conserva el cero', () => {
		expect(toPrice(0)).toBe(0);
	});
});
