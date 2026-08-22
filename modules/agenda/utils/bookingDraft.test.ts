import { describe, expect, it } from 'vitest';
import type { AppointmentSegment } from '@/types/appointments.types';
import {
	itemsChanged,
	offsetsOf,
	summarizeDraft,
	toDraftItems,
} from './bookingDraft';

const SERVICES = [
	{ id: 'corte', durationMinutes: 30, price: 50 },
	{ id: 'barba', durationMinutes: 30, price: 40 },
	{ id: 'cejas', durationMinutes: 20, price: 25 },
];

const segment = (
	serviceId: string,
	staffId: string | null,
	price = 50,
): AppointmentSegment => ({
	staffId,
	staffName: staffId,
	serviceId,
	serviceName: serviceId,
	startTime: '2026-08-24T13:00:00.000Z',
	endTime: '2026-08-24T13:30:00.000Z',
	price,
	durationMinutes: 30,
});

describe('toDraftItems', () => {
	it('conserva el profesional de cada servicio', () => {
		expect(
			toDraftItems([segment('corte', 'diego'), segment('barba', 'carlos')]),
		).toEqual([
			{ serviceId: 'corte', staffId: 'diego' },
			{ serviceId: 'barba', staffId: 'carlos' },
		]);
	});

	it('descarta el tramo sin profesional en lugar de inventar uno', () => {
		expect(toDraftItems([segment('corte', null)])).toEqual([]);
	});
});

describe('itemsChanged', () => {
	const saved = [
		{ serviceId: 'corte', staffId: 'diego' },
		{ serviceId: 'barba', staffId: 'carlos' },
	];

	it('lo mismo no es un cambio', () => {
		expect(itemsChanged(saved, [...saved])).toBe(false);
	});

	it('cambiar el profesional de un servicio es un cambio', () => {
		expect(
			itemsChanged(saved, [
				{ serviceId: 'corte', staffId: 'diego' },
				{ serviceId: 'barba', staffId: 'diego' },
			]),
		).toBe(true);
	});

	it('agregar o quitar un servicio es un cambio', () => {
		expect(itemsChanged(saved, [saved[0]])).toBe(true);
		expect(
			itemsChanged(saved, [...saved, { serviceId: 'cejas', staffId: 'diego' }]),
		).toBe(true);
	});

	it('reordenar es un cambio', () => {
		// Mover la barba antes del corte cambia a qué hora atiende cada uno.
		expect(itemsChanged(saved, [saved[1], saved[0]])).toBe(true);
	});
});

describe('summarizeDraft', () => {
	it('suma duraciones y precios vigentes', () => {
		expect(
			summarizeDraft({
				items: [
					{ serviceId: 'corte', staffId: 'diego' },
					{ serviceId: 'cejas', staffId: 'diego' },
				],
				services: SERVICES,
			}),
		).toEqual({ totalMinutes: 50, totalPrice: 75, unknownServiceIds: [] });
	});

	it('conserva el precio pactado de lo que la reserva ya tenía', () => {
		const summary = summarizeDraft({
			items: [
				{ serviceId: 'corte', staffId: 'diego' },
				{ serviceId: 'barba', staffId: 'diego' },
			],
			services: SERVICES,
			agreedPrices: new Map([['corte', 45]]),
		});

		// 45 pactado del corte + 40 de hoy de la barba, que se agrega ahora.
		expect(summary.totalPrice).toBe(85);
	});

	it('avisa del servicio que ya no existe en lugar de sumar de menos en silencio', () => {
		const summary = summarizeDraft({
			items: [
				{ serviceId: 'corte', staffId: 'diego' },
				{ serviceId: 'fantasma', staffId: 'diego' },
			],
			services: SERVICES,
		});

		expect(summary.unknownServiceIds).toEqual(['fantasma']);
		expect(summary.totalMinutes).toBe(30);
	});

	it('un borrador vacío no suma nada', () => {
		expect(
			summarizeDraft({ items: [], services: SERVICES }),
		).toEqual({ totalMinutes: 0, totalPrice: 0, unknownServiceIds: [] });
	});
});

describe('offsetsOf', () => {
	it('el primero arranca con la reserva', () => {
		expect(
			offsetsOf({
				items: [{ serviceId: 'corte', staffId: 'diego' }],
				services: SERVICES,
			}),
		).toEqual([0]);
	});

	it('cada tramo arranca después de lo que duró el anterior', () => {
		expect(
			offsetsOf({
				items: [
					{ serviceId: 'cejas', staffId: 'diego' },
					{ serviceId: 'corte', staffId: 'carlos' },
					{ serviceId: 'barba', staffId: 'diego' },
				],
				services: SERVICES,
			}),
		).toEqual([0, 20, 50]);
	});
});
