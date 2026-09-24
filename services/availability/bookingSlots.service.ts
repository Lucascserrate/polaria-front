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
	/**
	 * Empieza dentro del horario de atención pero termina después.
	 *
	 * Sólo llega con `scope: 'panel'`: al cliente se le ofrece únicamente lo que
	 * entra entero. Acá se ofrece marcado, para que quien agenda vea lo que está
	 * decidiendo en vez de no encontrar el horario.
	 */
	endsAfterHours?: boolean;
}

export const getBookingSlots = async (params: {
	date: string;
	serviceId: string;
	/**
	 * Omitirlo pregunta por **todo el equipo**: el motor devuelve los horarios en
	 * que alguien puede, con la lista de quiénes en `eligibleStaffIds`.
	 *
	 * Es lo que permite ofrecer la agenda real del negocio en lugar de la de la
	 * primera persona de la lista, que era lo que dejaba la pantalla sin horarios
	 * cuando esa persona justo estaba ocupada.
	 */
	staffId?: string;
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
