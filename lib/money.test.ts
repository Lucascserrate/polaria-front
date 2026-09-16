import { describe, expect, it } from 'vitest';
import { formatMoney } from './money';
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
