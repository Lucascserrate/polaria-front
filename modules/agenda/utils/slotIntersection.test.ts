import { describe, expect, it } from 'vitest';
import { intersectSlotStarts } from './slotIntersection';

const at = (time: string) => `2026-08-24T${time}:00.000Z`;

describe('intersectSlotStarts', () => {
	it('un solo tramo devuelve sus propios horarios', () => {
		expect(
			intersectSlotStarts([
				{ offsetMinutes: 0, startTimes: [at('13:00'), at('13:30')] },
			]),
		).toEqual([at('13:00'), at('13:30')]);
	});

	it('sobrevive el inicio en el que los dos tramos entran', () => {
		// Corte a las 13:00 con Diego y barba a las 13:30 con Carlos: la reserva
		// puede empezar a las 13:00.
		expect(
			intersectSlotStarts([
				{ offsetMinutes: 0, startTimes: [at('13:00'), at('14:00')] },
				{ offsetMinutes: 30, startTimes: [at('13:30')] },
			]),
		).toEqual([at('13:00')]);
	});

	it('descarta el inicio en el que el segundo tramo no entra', () => {
		// Diego puede a las 14:00, pero Carlos no tiene las 14:30: ofrecer las
		// 14:00 sería ofrecer un horario que el backend va a rechazar.
		expect(
			intersectSlotStarts([
				{ offsetMinutes: 0, startTimes: [at('14:00')] },
				{ offsetMinutes: 30, startTimes: [at('15:00')] },
			]),
		).toEqual([]);
	});

	it('respeta desplazamientos que no son de media hora', () => {
		expect(
			intersectSlotStarts([
				{ offsetMinutes: 0, startTimes: [at('13:00')] },
				{ offsetMinutes: 20, startTimes: [at('13:20')] },
			]),
		).toEqual([at('13:00')]);
	});

	it('exige que entren los tres tramos', () => {
		const items = [
			{ offsetMinutes: 0, startTimes: [at('13:00'), at('16:00')] },
			{ offsetMinutes: 30, startTimes: [at('13:30'), at('16:30')] },
			{ offsetMinutes: 60, startTimes: [at('14:00')] },
		];

		expect(intersectSlotStarts(items)).toEqual([at('13:00')]);
	});

	it('ordena y no repite', () => {
		expect(
			intersectSlotStarts([
				{
					offsetMinutes: 0,
					startTimes: [at('14:00'), at('13:00'), at('14:00')],
				},
			]),
		).toEqual([at('13:00'), at('14:00')]);
	});

	it('sin tramos no hay horarios', () => {
		expect(intersectSlotStarts([])).toEqual([]);
	});

	it('sin un tramo que arranque con la reserva no hay desde dónde contar', () => {
		expect(
			intersectSlotStarts([{ offsetMinutes: 30, startTimes: [at('13:30')] }]),
		).toEqual([]);
	});

	it('un tramo sin horarios deja la reserva sin opciones', () => {
		// Es el caso de un profesional que ese día no trabaja: no hay hora en la
		// que la reserva completa entre.
		expect(
			intersectSlotStarts([
				{ offsetMinutes: 0, startTimes: [at('13:00')] },
				{ offsetMinutes: 30, startTimes: [] },
			]),
		).toEqual([]);
	});
});
