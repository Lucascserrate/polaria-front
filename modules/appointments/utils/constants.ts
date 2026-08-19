import { AppointmentStatus } from '@/types/appointments.types';

export const APPOINTMENT_STATUS = {
	PENDING: 'pending',
	BOOKED: 'booked',
	CONFIRMED: 'confirmed',
	COMPLETED: 'completed',
	CANCELLED: 'cancelled',
} as const;

/**
 * Color por estado.
 *
 * `surface` es el tratamiento de la card en la agenda diaria, y se agregó acá en
 * lugar de armar un mapa aparte para que no existan dos verdades sobre qué color
 * es "completado". Lleva variantes `dark:` porque una card es superficie: en
 * modo oscuro, un `bg-green-50` deja texto claro sobre fondo casi blanco.
 *
 * El criterio es que el estado se lea sin gritar: pendiente es neutra y solo se
 * distingue por el borde lateral, completada tiene el fondo apenas teñido, y
 * cancelada baja de contraste en vez de pintarse de rojo.
 */
export const STATUS_COLORS = {
	pending: {
		badge: 'bg-blue-50 text-blue-700',
		dot: 'bg-blue-500',
		surface: 'bg-card border-border',
		accent: 'bg-blue-500',
	},
	booked: {
		badge: 'bg-purple-50 text-purple-700',
		dot: 'bg-purple-500',
		surface: 'bg-card border-border',
		accent: 'bg-purple-500',
	},
	confirmed: {
		badge: 'bg-sky-50 text-sky-700',
		dot: 'bg-sky-500',
		surface: 'bg-card border-border',
		accent: 'bg-sky-500',
	},
	completed: {
		badge: 'bg-green-50 text-green-700',
		dot: 'bg-green-500',
		surface:
			'bg-green-50 border-green-200 dark:bg-green-950/40 dark:border-green-900',
		accent: 'bg-green-500',
	},
	cancelled: {
		badge: 'bg-red-100 text-red-700',
		dot: 'bg-red-500',
		surface:
			'bg-muted/40 border-border opacity-60 dark:bg-muted/20',
		accent: 'bg-red-400',
	},
} as const;

const appointmentMap: Record<AppointmentStatus, string> = {
	pending: 'Pendiente',
	booked: 'Agendado',
	confirmed: 'Confirmado',
	completed: 'Finalizado',
	cancelled: 'Cancelado',
};

export const getAppointmentStatusText = (item: AppointmentStatus) => {
	return appointmentMap[item];
};
