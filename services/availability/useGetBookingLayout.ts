import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';

/** Un servicio de la reserva que se está armando. */
export interface BookingLayoutItem {
	serviceId: string;
	/** Omitirlo es "todavía sin asignar". */
	staffId?: string;
}

export interface BookingLayout {
	/** Minutos en que arranca cada servicio, en el mismo orden. */
	offsetsMinutes: number[];
	/** Lo que ocupa la reserva entera: hasta que termina el último servicio. */
	totalDurationMinutes: number;
}

const getBookingLayout = async (
	items: BookingLayoutItem[],
): Promise<BookingLayout> => {
	const { data } = await axiosInstance.post<BookingLayout>(
		'/availability/booking-layout',
		{ items },
	);
	return data;
};

/**
 * Dónde arranca cada servicio de la reserva que se está armando.
 *
 * Se le pregunta al servidor en lugar de encadenar las duraciones acá, y no es
 * una vuelta de más: **cuándo empieza cada servicio dejó de ser una cuenta que
 * el navegador pueda hacer**. Depende de qué categorías declaró el negocio que
 * se atienden a la vez y de a quién se asignó cada servicio, y es exactamente la
 * misma cuenta que va a hacer el backend al guardar. Calcularla en los dos lados
 * era lo que hacía que el drawer mostrara dos horas y la cita se escribiera en
 * una.
 *
 * Es barato y cacheado por la combinación de servicios y profesionales: mientras
 * no cambie ninguno de los dos, no se vuelve a pedir.
 */
const useGetBookingLayout = (items: BookingLayoutItem[], enabled = true) =>
	useQuery<BookingLayout>({
		queryKey: [
			'availability',
			'booking-layout',
			items.map((item) => `${item.serviceId}:${item.staffId ?? ''}`).join(','),
		],
		queryFn: () => getBookingLayout(items),
		enabled: enabled && items.length > 0,
		/*
		 * El reparto sólo cambia si el negocio edita sus reglas o la duración de un
		 * servicio, y ninguna de las dos cosas pasa mientras hay un drawer abierto.
		 */
		staleTime: 5 * 60_000,
	});

export default useGetBookingLayout;
