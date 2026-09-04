import { AppointmentStatus } from '@/types/appointments.types';

export const APPOINTMENT_STATUS = {
	PENDING: 'pending',
	CONFIRMED: 'confirmed',
	COMPLETED: 'completed',
	CANCELLED: 'cancelled',
} as const;

/**
 * Estados en los que la cita todavía espera una resolución.
 *
 * Marca dos cosas distintas que resultan ser la misma pregunta. En el menú de la
 * card, solo ahí tiene sentido ofrecer las acciones: una cita ya atendida o
 * cancelada no se toca desde la agenda, se corrige en la pantalla de citas. Y en
 * la card, es mientras la cita está abierta que el fondo lleva el color del
 * profesional; atendida y cancelada tienen su propio tratamiento y lo conservan.
 *
 * Vive acá, y no junto a la card, porque la comparten la card y su menú: tenerla
 * en uno de los dos obligaba al otro a importar del primero, y esa dependencia
 * cruzada entre dos módulos que ya se importan es como se arma un ciclo.
 */
export const OPEN_STATUSES: AppointmentStatus[] = ['pending', 'confirmed'];

/**
 * Color por estado.
 *
 * `surface` es el tratamiento de la card en la agenda diaria, y se agregó acá en
 * lugar de armar un mapa aparte para que no existan dos verdades sobre qué color
 * es "completado".
 *
 * Tanto `surface` como `badge` llevan variantes `dark:` porque los dos son
 * fondos teñidos: en modo oscuro, un `bg-emerald-50` es una mancha casi blanca
 * con texto oscuro adentro, que es la pastilla al revés. `dot` y `accent` no las
 * necesitan —son colores plenos sobre cualquier fondo—.
 *
 * El criterio es que el estado se lea sin gritar: pendiente es neutra y solo se
 * distingue por el borde lateral, completada tiene el fondo apenas teñido, y
 * cancelada baja de contraste en vez de pintarse de rojo.
 */
export const STATUS_COLORS = {
	pending: {
		badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
		dot: 'bg-blue-500',
		surface: 'bg-card border-border',
		accent: 'bg-blue-500',
	},
	confirmed: {
		badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
		dot: 'bg-sky-500',
		surface: 'bg-card border-border',
		accent: 'bg-sky-500',
	},
	completed: {
		badge:
			'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
		dot: 'bg-emerald-500',
		surface:
			'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900',
		accent: 'bg-emerald-500',
	},
	cancelled: {
		badge: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
		dot: 'bg-red-500',
		surface: 'bg-muted/40 border-border opacity-60 dark:bg-muted/20',
		accent: 'bg-red-400',
	},
} as const;

const appointmentMap: Record<AppointmentStatus, string> = {
	pending: 'Pendiente',
	confirmed: 'Confirmado',
	completed: 'Finalizado',
	cancelled: 'Cancelado',
};

export const getAppointmentStatusText = (item: AppointmentStatus) => {
	return appointmentMap[item];
};
