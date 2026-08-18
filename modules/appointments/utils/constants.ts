import { AppointmentStatus } from '@/types/appointments.types';

export const APPOINTMENT_STATUS = {
	PENDING: 'pending',
	BOOKED: 'booked',
	CONFIRMED: 'confirmed',
	COMPLETED: 'completed',
	CANCELLED: 'cancelled',
} as const;

export const STATUS_COLORS = {
	pending: {
		badge: 'bg-blue-50 text-blue-700',
		dot: 'bg-blue-500',
	},
	booked: {
		badge: 'bg-purple-50 text-purple-700',
		dot: 'bg-purple-500',
	},
	confirmed: {
		badge: 'bg-sky-50 text-sky-700',
		dot: 'bg-sky-500',
	},
	completed: {
		badge: 'bg-green-50 text-green-700',
		dot: 'bg-green-500',
	},
	cancelled: {
		badge: 'bg-red-100 text-red-700',
		dot: 'bg-red-500',
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
