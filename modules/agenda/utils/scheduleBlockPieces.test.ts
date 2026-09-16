import { describe, expect, it } from 'vitest';
import type { ScheduleBlock } from '@/services/schedule-blocks/schedule-blocks.service';
import {
	groupScheduleBlocksByDay,
	scheduleBlocksForStaff,
} from './calendarBlocks';
import { DAY_MINUTES } from './calendarLayout';

const LA_PAZ = 'America/La_Paz'; // UTC-4 todo el año

const block = (overrides: Partial<ScheduleBlock> = {}): ScheduleBlock => ({
	id: 'block-1',
	staffId: null,
	staffName: null,
	// 09:00 a 10:00 del 22 de agosto en La Paz.
	startTime: '2026-08-22T13:00:00.000Z',
	endTime: '2026-08-22T14:00:00.000Z',
	reason: null,
	...overrides,
});

describe('groupScheduleBlocksByDay', () => {
	it('lo ubica en el día de la zona del negocio, no del navegador', () => {
		// 21:00 del 22 en La Paz, que en UTC ya es el 23.
		const grouped = groupScheduleBlocksByDay(
			[
				block({
					startTime: '2026-08-23T01:00:00.000Z',
					endTime: '2026-08-23T02:00:00.000Z',
				}),
			],
			LA_PAZ,
		);

		expect([...grouped.keys()]).toEqual(['2026-08-22']);
		expect(grouped.get('2026-08-22')?.[0]).toMatchObject({
			startMinute: 21 * 60,
			endMinute: 22 * 60,
		});
	});

	it('traduce el instante a minutos del día', () => {
		const grouped = groupScheduleBlocksByDay([block()], LA_PAZ);

		expect(grouped.get('2026-08-22')?.[0]).toMatchObject({
			startMinute: 9 * 60,
			endMinute: 10 * 60,
		});
	});

	it('agrupa varios del mismo día', () => {
		const grouped = groupScheduleBlocksByDay(
			[
				block({ id: 'a' }),
				block({
					id: 'b',
					startTime: '2026-08-22T19:00:00.000Z',
					endTime: '2026-08-22T20:00:00.000Z',
				}),
			],
			LA_PAZ,
		);

		expect(grouped.get('2026-08-22')?.map((piece) => piece.key)).toEqual([
			'a',
			'b',
		]);
	});

	/*
	 * El que cruza la medianoche se dibuja solo en el día donde empieza, con el
	 * alto recortado al final de ese día: así la cola se ve —el bloque llega
	 * abajo— sin aparecer de nuevo al día siguiente diciendo que arranca a las 0.
	 */
	it('recorta al final del día el que cruza la medianoche', () => {
		const grouped = groupScheduleBlocksByDay(
			[
				block({
					// 23:00 del 22 en La Paz, dos horas.
					startTime: '2026-08-23T03:00:00.000Z',
					endTime: '2026-08-23T05:00:00.000Z',
				}),
			],
			LA_PAZ,
		);

		expect([...grouped.keys()]).toEqual(['2026-08-22']);
		expect(grouped.get('2026-08-22')?.[0].endMinute).toBe(DAY_MINUTES);
	});

	it('saltea el que no tiene instante legible', () => {
		const grouped = groupScheduleBlocksByDay(
			[block({ startTime: 'no es una fecha' })],
			LA_PAZ,
		);

		expect(grouped.size).toBe(0);
	});
});

describe('scheduleBlocksForStaff', () => {
	const pieces = groupScheduleBlocksByDay(
		[
			block({ id: 'negocio', staffId: null }),
			block({ id: 'de-diego', staffId: 'diego' }),
			block({ id: 'de-carlos', staffId: 'carlos' }),
		],
		LA_PAZ,
	).get('2026-08-22')!;

	/* Cerrar el local un rato le cierra la agenda a cada uno. */
	it('el del negocio entero le aplica a todos', () => {
		expect(scheduleBlocksForStaff(pieces, 'diego').map((p) => p.key)).toEqual([
			'negocio',
			'de-diego',
		]);
	});

	it('el de un profesional no le tapa horas a otro', () => {
		expect(scheduleBlocksForStaff(pieces, 'carlos').map((p) => p.key)).toEqual([
			'negocio',
			'de-carlos',
		]);
	});

	/* "Sin asignar" no es una persona: no tiene bloqueos propios. */
	it('sin profesional quedan solo los del negocio', () => {
		expect(scheduleBlocksForStaff(pieces, null).map((p) => p.key)).toEqual([
			'negocio',
		]);
	});
});
