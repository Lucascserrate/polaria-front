import { useQuery } from '@tanstack/react-query';
import { getBookingSlots } from './bookingSlots.service';

/**
 * Horarios disponibles para una fecha, un servicio y un profesional.
 *
 * Los tres son obligatorios: sin cualquiera de ellos la pregunta no tiene
 * respuesta, así que la consulta queda deshabilitada en lugar de pedirle al
 * backend algo incompleto.
 *
 * La combinación entra entera en la clave, para que volver un paso atrás y
 * recuperar una selección anterior no dispare otra consulta.
 */
const useGetBookingSlots = (
	date: string,
	serviceId: string | null,
	staffId: string | null,
	excludeAppointmentId?: string,
) => {
	return useQuery({
		queryKey: [
			'availability',
			'booking-slots',
			date,
			serviceId,
			staffId,
			excludeAppointmentId ?? null,
		],
		queryFn: () =>
			getBookingSlots({
				date,
				serviceId: serviceId as string,
				staffId: staffId as string,
				excludeAppointmentId,
			}),
		enabled: Boolean(date && serviceId && staffId),
		// Un horario puede ocuparse desde WhatsApp mientras el formulario está
		// abierto. Se revalida al volver el foco; la creación además maneja el 409.
		staleTime: 30_000,
	});
};

export default useGetBookingSlots;
