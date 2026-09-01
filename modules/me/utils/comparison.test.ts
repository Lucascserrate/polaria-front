import { describe, expect, it } from 'vitest';
import { compareRevenue } from './comparison';

describe('compareRevenue', () => {
	it('informa cuánto se subió respecto del período anterior', () => {
		expect(compareRevenue(224, 200)).toEqual({ trend: 'up', percent: 12 });
	});

	it('informa la baja sin signo, porque el signo lo lleva la flecha', () => {
		expect(compareRevenue(150, 200)).toEqual({ trend: 'down', percent: 25 });
	});

	it('llama "igual" a una diferencia que redondea a cero', () => {
		expect(compareRevenue(200.4, 200)).toEqual({ trend: 'flat', percent: 0 });
	});

	it('no inventa un porcentaje cuando el período anterior fue cero', () => {
		expect(compareRevenue(200, 0)).toEqual({ trend: 'up', percent: null });
	});

	it('no dice nada cuando los dos períodos están en cero', () => {
		expect(compareRevenue(0, 0)).toEqual({ trend: 'none', percent: null });
	});

	it('cuenta como -100% haber pasado de facturar a no facturar', () => {
		expect(compareRevenue(0, 200)).toEqual({ trend: 'down', percent: 100 });
	});
});
