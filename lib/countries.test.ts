import { describe, expect, it } from 'vitest';
import { COUNTRIES, countryForDial, splitPhone } from './countries';

describe('COUNTRIES', () => {
	it('trae los países donde opera Polaria', () => {
		const bolivia = COUNTRIES.find((country) => country.iso === 'BO');
		expect(bolivia?.dial).toBe('591');
		expect(bolivia?.flag).toBe('🇧🇴');
	});

	it('deriva la bandera del código, sin tabla de emojis', () => {
		expect(COUNTRIES.find((c) => c.iso === 'AR')?.flag).toBe('🇦🇷');
		expect(COUNTRIES.find((c) => c.iso === 'JP')?.flag).toBe('🇯🇵');
	});

	it('no repite países', () => {
		const isos = COUNTRIES.map((country) => country.iso);
		expect(new Set(isos).size).toBe(isos.length);
	});

	it('todos los prefijos son dígitos, sin el +', () => {
		for (const country of COUNTRIES) {
			expect(country.dial).toMatch(/^\d{1,4}$/);
		}
	});
});

describe('splitPhone', () => {
	it('parte un número con prefijo largo antes que uno corto', () => {
		// `1868` es Trinidad y `1` es Estados Unidos: probar el corto primero se
		// llevaría puesto al otro y dejaría "868…" como número nacional.
		expect(splitPhone('18685551234')).toEqual({
			dial: '1868',
			national: '5551234',
		});
		expect(splitPhone('15551234567')).toEqual({
			dial: '1',
			national: '5551234567',
		});
	});

	it('parte los números de la región', () => {
		expect(splitPhone('59170123456')).toEqual({
			dial: '591',
			national: '70123456',
		});
		expect(splitPhone('5491123456789')).toEqual({
			dial: '54',
			national: '91123456789',
		});
	});

	it('ignora el + y los separadores', () => {
		expect(splitPhone('+591 70 123 456')).toEqual({
			dial: '591',
			national: '70123456',
		});
	});

	it('no le inventa país a lo que no reconoce', () => {
		/*
		 * Un número corrupto tiene que volver a salir con sus dígitos intactos: si
		 * se le antepusiera un prefijo, abrir la ficha de ese cliente y guardarla
		 * cambiaría su teléfono sin que nadie lo haya tocado.
		 */
		expect(splitPhone('0009999')).toEqual({ dial: '', national: '0009999' });
	});

	it('con un número vacío no devuelve nada', () => {
		expect(splitPhone('')).toEqual({ dial: '', national: '' });
		expect(splitPhone('   ')).toEqual({ dial: '', national: '' });
	});
});

describe('countryForDial', () => {
	it('elige el país más probable de un prefijo compartido', () => {
		// Sin esto, `+1` mostraría Canadá y `+44` Guernesey, sólo por el orden
		// alfabético en castellano.
		expect(countryForDial('1')?.iso).toBe('US');
		expect(countryForDial('44')?.iso).toBe('GB');
	});

	it('resuelve los prefijos de un solo país', () => {
		expect(countryForDial('591')?.iso).toBe('BO');
		expect(countryForDial('598')?.iso).toBe('UY');
	});

	it('devuelve nada para un prefijo que no existe', () => {
		expect(countryForDial('999')).toBeNull();
		expect(countryForDial('')).toBeNull();
	});
});
