import { describe, expect, it } from 'vitest';
import { bucketAxisLabel, bucketFullLabel } from './timelineLabels';

describe('bucketAxisLabel', () => {
	it('en días es solo el número', () => {
		// El mes ya está en el encabezado del período: repetirlo en cada barra
		// gasta ancho sin agregar nada.
		expect(bucketAxisLabel('2026-08-09', 'day')).toBe('9');
		expect(bucketAxisLabel('2026-08-31', 'day')).toBe('31');
	});

	it('en meses es el mes abreviado, sin punto', () => {
		expect(bucketAxisLabel('2026-01', 'month')).toBe('ene');
		expect(bucketAxisLabel('2026-12', 'month')).toBe('dic');
	});

	it('no corre el día por la zona del navegador', () => {
		// La clave es una fecha calendaria: leerla en local devolvería el 8 al
		// oeste de Greenwich, y el eje diría "8" sobre la barra del 9.
		expect(bucketAxisLabel('2026-08-09', 'day')).not.toBe('8');
	});
});

describe('bucketFullLabel', () => {
	it('en días nombra el día completo', () => {
		expect(bucketFullLabel('2026-08-09', 'day')).toBe('Domingo, 9 de agosto');
	});

	it('en meses nombra el mes y el año', () => {
		expect(bucketFullLabel('2026-03', 'month')).toBe('Marzo de 2026');
	});

	it('empieza en mayúscula', () => {
		expect(bucketFullLabel('2026-08-09', 'day').charAt(0)).toBe('D');
	});
});
