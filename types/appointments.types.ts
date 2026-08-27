export type AppointmentStatus =
	'pending' | 'confirmed' | 'completed' | 'cancelled';

/** Estado del recordatorio de una cita, tal como lo informa el backend. */
export interface AppointmentReminderApi {
	state: string;
	scheduledFor: string | null;
	sentAt: string | null;
	failureReason: string | null;
}

/**
 * Un tramo de la cita: un servicio, con quién lo hace y cuándo.
 *
 * Una cita de dos servicios puede repartirse entre dos profesionales, y cada
 * tramo tiene horario propio. La agenda por profesional se dibuja con esto: en
 * la columna de cada uno va su tramo, no la cita entera.
 */
export interface AppointmentSegmentApi {
	staffId: string | null;
	staffName: string | null;
	/** Token de color del profesional. `null` si no eligió ninguno. */
	staffColor?: string | null;
	serviceId: string;
	serviceName: string | null;
	startTime: string;
	endTime: string;
	/** Lo pactado al reservar, no lo que el servicio cuesta hoy. */
	price: number;
	durationMinutes: number;
}

export interface AppointmentApi {
	id: string;
	startTime?: string;
	endTime?: string;
	startTimeFormatted: string;
	endTimeFormatted: string;
	status: AppointmentStatus;
	clientName?: string;
	staffName?: string;
	businessName?: string;
	serviceNames?: string[];
	totalDuration?: number;
	timezone?: string;
	segments?: AppointmentSegmentApi[];
	reminder?: AppointmentReminderApi | null;
}

/**
 * La reserva completa, para verla y editarla.
 *
 * El cliente viene aparte del nombre suelto porque el drawer lo muestra con su
 * teléfono, y en modo lectura: cambiar de quién es la cita no es editarla.
 */
export interface AppointmentDetailApi extends AppointmentApi {
	segments: AppointmentSegmentApi[];
	client: { id: string; name: string | null; phone: string | null } | null;
	totalPrice: number;
}

/** Las citas de un rango de días, para la agenda semanal. */
export interface AppointmentApiRange {
	items: AppointmentApi[];
	/** `YYYY-MM-DD`, ambos inclusive. */
	from: string;
	to: string;
	/** Zona del negocio. La grilla se dibuja en esta y no en la del navegador. */
	timezone: string;
}

export interface Appointment {
	id: string;
	clientName: string;
	timeLabel: string;
	sortKey: number;
	service: string;
	staff: string;
	status: AppointmentStatus;
	duration: number;
	/** Instante ISO de inicio. La agenda lo posiciona con `timezone`. */
	startTime: string;
	/** Instante ISO de fin. Ausente en citas viejas: se cae a `duration`. */
	endTime?: string;
	/** Zona del negocio. Sin ella la agenda se dibujaría en la hora del navegador. */
	timezone?: string;
	/** Tramos de la cita, ordenados por hora. Vacío en citas sin servicios. */
	segments: AppointmentSegment[];
	reminder?: AppointmentReminderApi | null;
}

export interface AppointmentSegment {
	staffId: string | null;
	staffName: string | null;
	/** Token de color del profesional. `null` si no eligió ninguno. */
	staffColor?: string | null;
	serviceId: string;
	serviceName: string | null;
	startTime: string;
	endTime: string;
	price: number;
	durationMinutes: number;
}

export interface ServiceApi {
	id: string;
	name: string;
	description?: string;
	price: number;
	timezone: string;
	durationMinutes: number;
	isActive: boolean;
}

export interface ClientApi {
	id: string;
	name?: string;
	phone: string;
	notes?: string;
}
