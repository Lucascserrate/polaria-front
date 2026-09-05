import type { LucideIcon } from 'lucide-react';
import {
	BarChart3,
	CalendarDays,
	Clock3,
	MessageCircle,
	NotebookPen,
	Users,
} from 'lucide-react';

export const businessTypes = [
	'Barberías',
	'Salones de Belleza',
	'Spas & Bienestar',
	'Clínicas Dentales',
	'Medicina Estética',
	'Cosmética',
	'Y más...',
];

export const features: {
	icon: LucideIcon;
	title: string;
	description: string;
}[] = [
	{
		icon: CalendarDays,
		title: 'Agenda de citas',
		description:
			'Agenda ágil, visual y sincronizada en tiempo real para evitar solapamientos.',
	},
	{
		icon: Users,
		title: 'Profesionales y servicios',
		description:
			'Asigna roles, comisiones, horarios personalizados y gestiona tu equipo fácilmente.',
	},
	{
		icon: NotebookPen,
		title: 'Gestión de clientes',
		description:
			'Historial detallado de visitas, preferencias y contacto directo en un clic.',
	},
	{
		icon: Clock3,
		title: 'Disponibilidad de horarios',
		description:
			'Configura tus horas de trabajo, pausas, feriados y vacaciones con total flexibilidad.',
	},
	{
		icon: MessageCircle,
		title: 'Recordatorios automáticos',
		description:
			'Envío automático de notificaciones para reducir inasistencias en más de un 85%.',
	},
	{
		icon: BarChart3,
		title: 'Analíticas del negocio',
		description:
			'Visualiza ingresos, servicios más demandados y estadísticas de rendimiento.',
	},
];

export type AppointmentStatus =
	| 'pending'
	| 'confirmed'
	| 'cancelled'
	| 'completed';

export type MockStaff = {
	id: string;
	name: string;
	role: string;
	color: string;
};

export type MockService = {
	id: string;
	name: string;
	duration: number;
};

export type MockAppointment = {
	id: string;
	client: string;
	serviceId: string;
	staffId: string;
	start: string;
	end: string;
	status: AppointmentStatus;
};

export const mockStaff: MockStaff[] = [
	{
		id: 'staff-carlos',
		name: 'Carlos M.',
		role: 'Barbero Senior',
		color: '#111827',
	},
	{ id: 'staff-juan', name: 'Juan P.', role: 'Barbero', color: '#4b5563' },
	{
		id: 'staff-sofia',
		name: 'Sofía V.',
		role: 'Estilista Senior',
		color: '#b7791f',
	},
	{ id: 'staff-mateo', name: 'Mateo R.', role: 'Colorista', color: '#0f766e' },
];

export const mockServices: MockService[] = [
	{ id: 'service-cut', name: 'Corte clásico', duration: 30 },
	{ id: 'service-beard', name: 'Barba', duration: 30 },
	{ id: 'service-color', name: 'Corte & Color', duration: 60 },
];

export const mockAppointments: MockAppointment[] = [
	{
		id: 'appointment-1',
		client: 'Diego P.',
		serviceId: 'service-cut',
		staffId: 'staff-carlos',
		start: '09:30',
		end: '10:00',
		status: 'confirmed',
	},
	{
		id: 'appointment-2',
		client: 'Matías G.',
		serviceId: 'service-beard',
		staffId: 'staff-carlos',
		start: '10:30',
		end: '11:00',
		status: 'pending',
	},
	{
		id: 'appointment-3',
		client: 'Lucía R.',
		serviceId: 'service-color',
		staffId: 'staff-sofia',
		start: '13:30',
		end: '14:30',
		status: 'confirmed',
	},
	{
		id: 'appointment-4',
		client: 'Ana C.',
		serviceId: 'service-color',
		staffId: 'staff-mateo',
		start: '14:00',
		end: '15:00',
		status: 'completed',
	},
	{
		id: 'appointment-5',
		client: 'Laura S.',
		serviceId: 'service-cut',
		staffId: 'staff-juan',
		start: '09:30',
		end: '10:00',
		status: 'completed',
	},
	{
		id: 'appointment-6',
		client: 'Emma V.',
		serviceId: 'service-beard',
		staffId: 'staff-juan',
		start: '10:00',
		end: '10:30',
		status: 'confirmed',
	},
	{
		id: 'appointment-7',
		client: 'Tomas R.',
		serviceId: 'service-color',
		staffId: 'staff-juan',
		start: '13:00',
		end: '14:00',
		status: 'pending',
	},
	{
		id: 'appointment-8',
		client: 'Sofia D.',
		serviceId: 'service-cut',
		staffId: 'staff-sofia',
		start: '11:00',
		end: '11:30',
		status: 'confirmed',
	},
	{
		id: 'appointment-9',
		client: 'Marta L.',
		serviceId: 'service-color',
		staffId: 'staff-sofia',
		start: '14:30',
		end: '15:30',
		status: 'confirmed',
	},
	{
		id: 'appointment-10',
		client: 'Pedro N.',
		serviceId: 'service-color',
		staffId: 'staff-mateo',
		start: '10:00',
		end: '11:00',
		status: 'completed',
	},
	{
		id: 'appointment-11',
		client: 'Marta L.',
		serviceId: 'service-beard',
		staffId: 'staff-mateo',
		start: '13:30',
		end: '14:00',
		status: 'confirmed',
	},
	{
		id: 'appointment-12',
		client: 'Pedro N.',
		serviceId: 'service-color',
		staffId: 'staff-mateo',
		start: '15:30',
		end: '17:00',
		status: 'pending',
	},
];

export const whatsappMessages = [
	{
		from: 'Cliente',
		text: 'Hola, quiero reservar para mañana',
		bubble: 'bubble-white',
	},
	{
		from: 'Polaria',
		text: '¡Hola! 👋 ¿Qué servicio te gustaría agendar?',
		bubble: 'bubble-green',
	},
	{ from: 'Cliente', text: 'Corte clásico', bubble: 'bubble-white' },
	{
		from: 'Polaria',
		text: 'Estos son los horarios disponibles:\n10:00 · 12:30 · 16:30',
		bubble: 'bubble-green',
	},
	{ from: 'Cliente', text: '16:30', bubble: 'bubble-white' },
	{
		from: 'Polaria',
		text: '¡Listo! Tu turno quedó agendado. ✅\nCorte clásico · mañana 16:30',
		bubble: 'bubble-green',
	},
] as const;

export const steps = [
	{
		index: '01',
		title: 'El cliente escribe',
		description: 'Consultando disponibilidad por WhatsApp.',
	},
	{
		index: '02',
		title: 'Polaria ofrece horarios',
		description:
			'El bot inteligente lee tu agenda real y propone opciones en segundos.',
	},
	{
		index: '03',
		title: 'El cliente elige',
		description: 'Solo tiene que responder con la hora o servicio preferido.',
	},
	{
		index: '04',
		title: 'Cita organizada',
		description:
			'Se crea automáticamente en tu agenda y el cliente recibe confirmación.',
	},
];

export const simpleSteps = [
	{
		index: '01',
		title: 'Configurá tu negocio',
		description:
			'Registra tus servicios, añade a los miembros de tu equipo y establece sus horarios de trabajo.',
	},
	{
		index: '02',
		title: 'Compartí tu link o WhatsApp',
		description:
			'Coloca tu link de reservas en Instagram o conecta el bot de WhatsApp para recibir turnos en piloto automático.',
	},
	{
		index: '03',
		title: 'Gestioná todo en un solo lugar',
		description:
			'Controla tu flujo diario desde el panel administrativo. Visualiza analíticas, historial y agiliza las operaciones.',
	},
];

export const scheduleTimeSlots = [
	'09:00',
	'10:00',
	'11:00',
	'12:00',
	'13:00',
	'14:00',
	'15:00',
	'16:00',
];

export const agendaSidebarItems = [
	'Agenda',
	'Equipo',
	'Clientes',
	'Servicios',
	'Analíticas',
];

export const appointmentStatuses: AppointmentStatus[] = [
	'pending',
	'confirmed',
	'cancelled',
	'completed',
];
