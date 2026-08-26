import { describe, expect, it } from 'vitest';
import { accessStateOf } from './access';

describe('accessStateOf', () => {
	it('sin correo de acceso no tiene acceso', () => {
		expect(accessStateOf({})).toBe('NONE');
		expect(accessStateOf({ accessEmail: null })).toBe('NONE');
	});

	it('un correo en blanco tampoco cuenta', () => {
		expect(accessStateOf({ accessEmail: '   ' })).toBe('NONE');
	});

	it('con correo y sin cuenta vinculada, la invitación está pendiente', () => {
		expect(accessStateOf({ accessEmail: 'marco@barberia.com' })).toBe(
			'INVITED',
		);
	});

	it('con cuenta vinculada, el acceso está activo', () => {
		expect(
			accessStateOf({
				accessEmail: 'marco@barberia.com',
				accessGoogleId: 'g-1',
			}),
		).toBe('ACTIVE');
	});

	/*
	 * No es un estado que el servidor produzca —revocar borra los dos campos— pero
	 * si llegara, lo que habilita entrar es el correo: sin él no hay acceso.
	 */
	it('una cuenta vinculada sin correo se lee como sin acceso', () => {
		expect(accessStateOf({ accessGoogleId: 'g-1' })).toBe('NONE');
	});
});
