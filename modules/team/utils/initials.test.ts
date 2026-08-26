import { describe, expect, it } from 'vitest';
import { initialsOf } from './initials';

describe('initialsOf', () => {
	it('toma la inicial del nombre y la del apellido', () => {
		expect(initialsOf({ firstName: 'Lucas', lastName: 'Serrate' })).toBe('LS');
	});

	it('con un solo nombre usa sus dos primeras letras', () => {
		expect(initialsOf({ firstName: 'Marco' })).toBe('MA');
	});

	it('cae al nombre completo cuando no hay campos partidos', () => {
		expect(initialsOf({ name: 'Ana López' })).toBe('AL');
		expect(initialsOf({ name: 'Ana' })).toBe('AN');
	});

	it('nunca queda vacío', () => {
		expect(initialsOf({})).toBe('?');
		expect(initialsOf({ firstName: '   ' })).toBe('?');
	});
});
