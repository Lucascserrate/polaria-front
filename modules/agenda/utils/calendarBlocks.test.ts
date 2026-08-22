import { describe, expect, it } from 'vitest';
import type { Appointment } from '@/types/appointments.types';
import { groupBlocksByDay } from './calendarBlocks';
import { DAY_MINUTES } from './calendarLayout';

const LA_PAZ = 'America/La_Paz';

const appointment = (overrides: Partial<Appointment>): Appointment =>
	({
		id: 'appt-1',
		clientName: 'Ana',
		timeLabel: '09:00',
		sortKey: 0,
		service: 'Corte',
		staff: 'Diego',
		status: 'confirmed',
		duration: 30,
		startTime: '2026-08-22T13:00:00.000Z',
		endTime: '2026-08-22T13:30:00.000Z',
		timezone: LA_PAZ,
		segments: [],
		reminder: null,
		...overrides,
	}) as Appointment;

describe('groupBlocksByDay', () => {
	it('ubica la cita en su día y en su minuto', () => {
		const grouped = groupBlocksByDay([appointment({})], LA_PAZ);

		expect([...grouped.keys()]).toEqual(['2026-08-22']);
		expect(grouped.get('2026-08-22')).toEqual([
			{
				key: 'appt-1',
				appointment: expect.objectContaining({ id: 'appt-1' }),
				startMinute: 9 * 60,
				endMinute: 9 * 60 + 30,
			},
		]);
	});

	it('una cita de la noche pertenece a su día local, no al de UTC', () => {
		// 02:00 UTC del 23 son las 22:00 del 22 en Bolivia. Con la fecha de UTC, la
		// última cita del día aparecería en la columna del día siguiente.
		const grouped = groupBlocksByDay(
			[
				appointment({
					startTime: '2026-08-23T02:00:00.000Z',
					endTime: '2026-08-23T02:30:00.000Z',
				}),
			],
			LA_PAZ,
		);

		expect([...grouped.keys()]).toEqual(['2026-08-22']);
		expect(grouped.get('2026-08-22')?.[0].startMinute).toBe(22 * 60);
	});

	it('junta en la misma columna las citas del mismo día', () => {
		const grouped = groupBlocksByDay(
			[
				appointment({ id: 'a' }),
				appointment({
					id: 'b',
					startTime: '2026-08-22T17:00:00.000Z',
					endTime: '2026-08-22T17:30:00.000Z',
				}),
			],
			LA_PAZ,
		);

		expect(grouped.get('2026-08-22')?.map((block) => block.key)).toEqual([
			'a',
			'b',
		]);
	});

	it('separa los días distintos', () => {
		const grouped = groupBlocksByDay(
			[
				appointment({ id: 'sabado' }),
				appointment({
					id: 'domingo',
					startTime: '2026-08-23T13:00:00.000Z',
					endTime: '2026-08-23T13:30:00.000Z',
				}),
			],
			LA_PAZ,
		);

		expect([...grouped.keys()]).toEqual(['2026-08-22', '2026-08-23']);
	});

	it('recorta a medianoche la que cruza al día siguiente', () => {
		const grouped = groupBlocksByDay(
			[
				appointment({
					startTime: '2026-08-23T03:30:00.000Z',
					endTime: '2026-08-23T04:30:00.000Z',
					duration: 60,
				}),
			],
			LA_PAZ,
		);

		expect(grouped.get('2026-08-22')?.[0]).toMatchObject({
			startMinute: 23 * 60 + 30,
			endMinute: DAY_MINUTES,
		});
	});

	it('saltea la cita sin instante legible', () => {
		const grouped = groupBlocksByDay(
			[appointment({ startTime: '', endTime: undefined })],
			LA_PAZ,
		);

		expect(grouped.size).toBe(0);
	});

	it('cae en la zona de la cita cuando no se le pasa ninguna', () => {
		// El backend manda la zona del negocio en cada cita: es el respaldo si la
		// configuración todavía no llegó.
		const grouped = groupBlocksByDay([
			appointment({ startTime: '2026-08-23T02:00:00.000Z' }),
		]);

		expect([...grouped.keys()]).toEqual(['2026-08-22']);
	});
});
