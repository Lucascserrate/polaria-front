import { axiosInstance } from '@/lib/axios';

/**
 * Un horario ofrecible, tal como lo devuelve el mismo motor que usa WhatsApp.
 *
 * `endTime` viene del backend y no se recalcula acá: la duración del servicio ya
 * está resuelta del lado que decide la disponibilidad, y volver a sumarla en el
 * navegador abriría la puerta a que las dos cuentas no coincidan.
 */
export interface BookingSlot {
	startTime: string;
	endTime: string;
	eligibleStaffIds: string[];
}

export const getBookingSlots = async (params: {
	date: string;
	serviceId: string;
	staffId: string;
	/**
	 * Reserva que se está editando: sus minutos no cuentan como ocupados.
	 *
	 * Sin esto, editar una cita de 09:00 no podría ofrecer las 09:15 porque la
	 * propia cita estaría bloqueando ese rato.
	 */
	excludeAppointmentId?: string;
	/**
	 * Quién pregunta.
	 *
	 * `panel` no aplica la anticipación mínima del cliente: el administrador
	 * registra, no avisa. El backend es el que traduce eso a un piso concreto.
	 */
	scope?: 'client' | 'panel';
}): Promise<BookingSlot[]> => {
	const { data } = await axiosInstance.get<BookingSlot[]>(
		'/availability/booking-slots',
		{ params },
	);
	return data;
};
