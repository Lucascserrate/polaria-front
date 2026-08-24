import { describe, expect, it } from 'vitest';
import { buildHistoricalSlots } from './panelSlots';
import { DAY_MINUTES } from './calendarLayout';

/** El negocio abrió de 09:00 a 19:00 ese día. */
const OPEN = [{ startMinute: 9 * 60, endMinute: 19 * 60 }];

const at = (hour: number, minutes = 0) => hour * 60 + minutes;

const build = (input?: {
	durationMinutes?: number;
	busyRanges?: Array<{ startMinute: number; endMinute: number }>;
	openRanges?: Array<{ startMinute: number; endMinute: number }>;
}) =>
	buildHistoricalSlots({
		durationMinutes: input?.durationMinutes ?? 30,
		busyRanges: input?.busyRanges,
		openRanges: input?.openRanges ?? OPEN,
	});

describe('buildHistoricalSlots', () => {
	it('cubre el día entero en tramos de 15 minutos', () => {
		const slots = build();

		expect(slots[0].minute).toBe(0);
		expect(slots[1].minute).toBe(15);
		// Media hora no puede empezar más tarde de las 23:30.
		expect(slots.at(-1)?.minute).toBe(at(23, 30));
	});

	it('no ofrece un horario en el que la reserva no entra', () => {
		// Dos horas no pueden empezar a las 22:15.
		const slots = build({ durationMinutes: 120 });

		expect(slots.at(-1)?.minute).toBe(at(22, 0));
		expect(slots.every((slot) => slot.minute + 120 <= DAY_MINUTES)).toBe(true);
	});

	it('marca fuera de horario lo que el negocio no atendía', () => {
		const slots = build();
		const find = (minute: number) =>
			slots.find((slot) => slot.minute === minute);

		expect(find(at(8, 30))?.outsideHours).toBe(true);
		expect(find(at(9, 0))?.outsideHours).toBe(false);
		expect(find(at(20, 0))?.outsideHours).toBe(true);
	});

	it('el cierre parte la reserva y eso cuenta como fuera de horario', () => {
		// 18:45 + 30 minutos termina 19:15, después del cierre.
		expect(
			build().find((slot) => slot.minute === at(18, 45))?.outsideHours,
		).toBe(true);
	});

	it('un día cerrado deja todo el día fuera de horario', () => {
		expect(build({ openRanges: [] }).every((slot) => slot.outsideHours)).toBe(
			true,
		);
	});

	it('respeta el turno partido', () => {
		const split = [
			{ startMinute: at(9), endMinute: at(13) },
			{ startMinute: at(15), endMinute: at(19) },
		];
		const slots = build({ openRanges: split });
		const find = (minute: number) =>
			slots.find((slot) => slot.minute === minute);

		expect(find(at(12, 0))?.outsideHours).toBe(false);
		expect(find(at(14, 0))?.outsideHours).toBe(true);
		expect(find(at(16, 0))?.outsideHours).toBe(false);
	});

	it('marca ocupado lo que se pisa con otra cita', () => {
		const slots = build({
			busyRanges: [{ startMinute: at(10), endMinute: at(11) }],
		});
		const find = (minute: number) =>
			slots.find((slot) => slot.minute === minute);

		// Media hora desde 09:45 termina 10:15: se pisa.
		expect(find(at(9, 45))?.busy).toBe(true);
		expect(find(at(10, 30))?.busy).toBe(true);
		// Termina justo cuando la otra empieza: no se pisan.
		expect(find(at(9, 30))?.busy).toBe(false);
		// Empieza justo cuando la otra termina: tampoco.
		expect(find(at(11, 0))?.busy).toBe(false);
	});

	it('sin citas nada está ocupado', () => {
		expect(build().every((slot) => slot.busy === false)).toBe(true);
	});

	it('una duración inválida se trata como un tramo', () => {
		// Cero minutos generaría un bucle infinito de tramos del mismo instante.
		const slots = build({ durationMinutes: 0 });

		expect(slots.length).toBeGreaterThan(0);
		expect(slots.at(-1)?.minute).toBe(at(23, 45));
	});
});
