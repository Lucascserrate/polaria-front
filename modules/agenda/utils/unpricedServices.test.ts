import { describe, expect, it } from 'vitest';
import { unpricedServicesOf, type FinishingSegment } from './unpricedServices';

const segment = (
	serviceId: string,
	price: number | null,
): FinishingSegment => ({
	serviceId,
	serviceName: serviceId,
	staffName: 'Diego',
	durationMinutes: 60,
	price,
	currency: 'BOB',
});

const booking = (segments: FinishingSegment[]) => ({ id: 'cita', segments });

describe('unpricedServicesOf', () => {
	it('encuentra el servicio que se cotiza', () => {
		const pending = unpricedServicesOf(
			booking([segment('corte', 80), segment('color', null)]),
		);

		expect(pending.map((item) => item.serviceId)).toEqual(['color']);
	});

	it('la cita con todos sus precios no pregunta nada', () => {
		expect(unpricedServicesOf(booking([segment('corte', 80)]))).toHaveLength(0);
	});

	it('el precio cero es un precio: no se pregunta', () => {
		// Una cortesía o un retoque sin cargo ya está dicho; volver a preguntar
		// sería no creerle al negocio.
		expect(unpricedServicesOf(booking([segment('retoque', 0)]))).toHaveLength(
			0,
		);
	});

	it('el mismo servicio dos veces se pregunta una sola vez', () => {
		// El precio se pacta por servicio, que es como lo guarda el backend.
		const pending = unpricedServicesOf(
			booking([segment('color', null), segment('color', null)]),
		);

		expect(pending).toHaveLength(1);
	});

	it('una cita sin tramos no pregunta nada', () => {
		// Pasa cuando la pantalla no los trajo: se finaliza como se finalizaba
		// antes, sin inventar una pregunta sobre servicios que no se conocen.
		expect(unpricedServicesOf(booking([]))).toHaveLength(0);
	});
});
