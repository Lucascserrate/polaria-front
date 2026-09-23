import { describe, expect, it } from 'vitest';
import type { AppointmentSegment } from '@/types/appointments.types';
import {
	itemsChanged,
	offsetsOf,
	savedOffsetsOf,
	summarizeDraft,
	toDraftItems,
} from './bookingDraft';

const SERVICES = [
	{ id: 'corte', durationMinutes: 30, price: 50, currency: 'BOB' },
	{ id: 'barba', durationMinutes: 30, price: 40, currency: 'BOB' },
	{ id: 'cejas', durationMinutes: 20, price: 25, currency: 'BOB' },
	// En dólares a propósito: un catálogo puede cobrar en dos monedas.
	{ id: 'online', durationMinutes: 40, price: 30, currency: 'USD' },
];

const segment = (
	serviceId: string,
	staffId: string | null,
	price = 50,
	currency = 'BOB',
): AppointmentSegment => ({
	staffId,
	staffName: staffId,
	serviceId,
	serviceName: serviceId,
	startTime: '2026-08-24T13:00:00.000Z',
	endTime: '2026-08-24T13:30:00.000Z',
	price,
	currency,
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
		).toEqual({
			totalMinutes: 50,
			totals: [{ currency: 'BOB', amount: 75 }],
			unpriced: 0,
			unknownServiceIds: [],
		});
	});

	it('conserva el precio pactado de lo que la reserva ya tenía', () => {
		const summary = summarizeDraft({
			items: [
				{ serviceId: 'corte', staffId: 'diego' },
				{ serviceId: 'barba', staffId: 'diego' },
			],
			services: SERVICES,
			agreedPrices: new Map([['corte', { price: 45, currency: 'BOB' }]]),
		});

		// 45 pactado del corte + 40 de hoy de la barba, que se agrega ahora.
		expect(summary.totals).toEqual([{ currency: 'BOB', amount: 85 }]);
	});

	it('no mezcla monedas distintas en un solo total', () => {
		// Una consulta presencial y una sesión online para el exterior entran en la
		// misma reserva: sumarlas daría un número que no se le puede cobrar a nadie.
		const summary = summarizeDraft({
			items: [
				{ serviceId: 'corte', staffId: 'diego' },
				{ serviceId: 'online', staffId: 'diego' },
			],
			services: SERVICES,
		});

		expect(summary.totals).toEqual([
			{ currency: 'BOB', amount: 50 },
			{ currency: 'USD', amount: 30 },
		]);
	});

	it('conserva la moneda pactada aunque el servicio haya cambiado de moneda', () => {
		// Pasar un servicio a dólares no puede reescribir lo que ya se acordó: eso
		// convertiría Bs 300 en USD 300.
		const summary = summarizeDraft({
			items: [{ serviceId: 'online', staffId: 'diego' }],
			services: SERVICES,
			agreedPrices: new Map([['online', { price: 300, currency: 'BOB' }]]),
		});

		expect(summary.totals).toEqual([{ currency: 'BOB', amount: 300 }]);
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
		expect(summarizeDraft({ items: [], services: SERVICES })).toEqual({
			totalMinutes: 0,
			totals: [],
			unpriced: 0,
			unknownServiceIds: [],
		});
	});

	it('cuenta aparte los tramos que todavía no tienen precio', () => {
		// La coloración se cotiza: el total de la cita es lo que ya hay **más
		// algo**, y decir "Bs 50" sería decir lo que no se va a cobrar.
		const summary = summarizeDraft({
			items: [
				{ serviceId: 'corte', staffId: 'diego' },
				{ serviceId: 'color', staffId: 'diego' },
			],
			services: [
				...SERVICES,
				{ id: 'color', durationMinutes: 60, price: null, currency: 'BOB' },
			],
		});

		expect(summary.totals).toEqual([{ currency: 'BOB', amount: 50 }]);
		expect(summary.unpriced).toBe(1);
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

/**
 * Lo que cambia cuando dos servicios de la reserva se atienden a la vez.
 *
 * El reparto lo decide el servidor —depende de las reglas del negocio y de a
 * quién se asignó cada servicio— y llega como `offsets`. Acá se prueba que las
 * cuentas del drawer lo respeten en lugar de volver a encadenar por su cuenta,
 * que es lo que hacía que la pantalla dijera dos horas para una reserva de una.
 */
describe('summarizeDraft con servicios simultáneos', () => {
	const items = [
		{ serviceId: 'corte', staffId: 'diego' },
		{ serviceId: 'barba', staffId: 'carlos' },
	];

	it('el total es lo que la reserva ocupa, no la suma de los servicios', () => {
		const summary = summarizeDraft({
			items,
			services: SERVICES,
			offsets: [0, 0],
		});

		expect(summary.totalMinutes).toBe(30);
	});

	it('sin offsets encadena, que es la reserva de siempre', () => {
		expect(summarizeDraft({ items, services: SERVICES }).totalMinutes).toBe(60);
	});

	/*
	 * Con duraciones distintas la tanda dura lo que el más largo, y el total no
	 * puede salir del último de la lista: la barba termina antes que el online
	 * aunque esté escrita después.
	 */
	it('mide hasta el que termina más tarde, no hasta el último', () => {
		const summary = summarizeDraft({
			items: [
				{ serviceId: 'online', staffId: 'diego' },
				{ serviceId: 'barba', staffId: 'carlos' },
			],
			services: SERVICES,
			offsets: [0, 0],
		});

		expect(summary.totalMinutes).toBe(40);
	});
});

describe('savedOffsetsOf', () => {
	const START = '2026-08-24T13:00:00.000Z';

	const at = (serviceId: string, startTime: string): AppointmentSegment => ({
		...segment(serviceId, 'diego'),
		startTime,
	});

	it('de una reserva encadenada devuelve los minutos acumulados', () => {
		expect(
			savedOffsetsOf(START, [
				at('corte', '2026-08-24T13:00:00.000Z'),
				at('barba', '2026-08-24T13:30:00.000Z'),
			]),
		).toEqual([0, 30]);
	});

	/*
	 * La razón de existir: al abrir el drawer de una cita simultánea, sus tramos
	 * tienen que dibujarse como están en la agenda desde el primer cuadro. Con el
	 * encadenado se veía el segundo servicio una hora más tarde de lo que es.
	 */
	it('de una reserva simultánea devuelve cero en los dos', () => {
		expect(
			savedOffsetsOf(START, [
				at('corte', '2026-08-24T13:00:00.000Z'),
				at('barba', '2026-08-24T13:00:00.000Z'),
			]),
		).toEqual([0, 0]);
	});

	it('saltea los tramos sin profesional, igual que `toDraftItems`', () => {
		expect(
			savedOffsetsOf(START, [
				at('corte', '2026-08-24T13:00:00.000Z'),
				{ ...at('barba', '2026-08-24T13:30:00.000Z'), staffId: null },
			]),
		).toEqual([0]);
	});

	it('con un inicio que no es una fecha no devuelve nada', () => {
		expect(
			savedOffsetsOf('no es una fecha', [segment('corte', 'diego')]),
		).toEqual([]);
	});
});
