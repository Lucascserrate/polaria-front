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
	'Barberias',
	'Salones de Belleza',
	'Spas & Bienestar',
	'Clinicas Dentales',
	'Medicina Estetica',
	'Cosmetica',
	'Y mas...',
];
export const features: {
	icon: LucideIcon;
	title: string;
	description: string;
}[] = [
	{
		icon: CalendarDays,
		title: 'Agenda de citas',
		description: 'Agenda agil, visual y sincronizada en tiempo real.',
	},
	{
		icon: Users,
		title: 'Profesionales y servicios',
		description: 'Gestiona roles, horarios y servicios facilmente.',
	},
	{
		icon: NotebookPen,
		title: 'Gestion de clientes',
		description: 'Historial detallado y contacto directo en un clic.',
	},
	{
		icon: Clock3,
		title: 'Disponibilidad de horarios',
		description: 'Configura horas de trabajo, pausas y vacaciones.',
	},
	{
		icon: MessageCircle,
		title: 'Recordatorios automaticos',
		description: 'Notificaciones automaticas para reducir inasistencias.',
	},
	{
		icon: BarChart3,
		title: 'Analiticas del negocio',
		description: 'Visualiza ingresos y estadisticas de rendimiento.',
	},
];
export type AppointmentStatus =
	| 'pending'
	| 'confirmed'
	| 'cancelled'
	| 'completed';
export type AgendaSection =
	| 'agenda'
	| 'clientes'
	| 'servicios'
	| 'personal'
	| 'analiticas'
	| 'configuracion';
export type AgendaSidebarItem = { id: AgendaSection; label: string };
export type MockClient = {
	id: string;
	name: string;
	phone: string;
	origin: string;
	joinedAt: string;
};
export type MockStaff = {
	id: string;
	name: string;
	initials: string;
	role: string;
	color: string;
	services: string[];
	commission: string;
	active: boolean;
};
export type MockService = {
	id: string;
	name: string;
	description: string;
	duration: number;
	price: number;
	appointments: number;
};
export type MockAppointment = {
	id: string;
	client: string;
	serviceId: string;
	staffId: string;
	start: string;
	end: string;
	status: AppointmentStatus;
	weekday: number;
};

export const mockClients: MockClient[] = [
	{
		id: 'juan',
		name: 'Juan Perez',
		phone: '+591 712 34001',
		origin: 'Reserva online',
		joinedAt: '12 ago 2026',
	},
	{
		id: 'carlos',
		name: 'Carlos Rodriguez',
		phone: '+591 712 34002',
		origin: 'WhatsApp',
		joinedAt: '14 ago 2026',
	},
	{
		id: 'andres',
		name: 'Andres Gomez',
		phone: '+591 712 34003',
		origin: 'Sin registrar',
		joinedAt: '15 ago 2026',
	},
	{
		id: 'mateo',
		name: 'Mateo Sanchez',
		phone: '+591 712 34004',
		origin: 'WhatsApp',
		joinedAt: '16 ago 2026',
	},
	{
		id: 'sebastian',
		name: 'Sebastian Torres',
		phone: '+591 712 34005',
		origin: 'Reserva online',
		joinedAt: '17 ago 2026',
	},
	{
		id: 'daniel',
		name: 'Daniel Martinez',
		phone: '+591 712 34006',
		origin: 'Sin registrar',
		joinedAt: '18 ago 2026',
	},
];
export const mockStaff: MockStaff[] = [
	{
		id: 'carlos-staff',
		name: 'Carlos',
		initials: 'CR',
		role: 'Barbero senior',
		color: '#6d78d9',
		services: ['Corte clasico', 'Corte + barba'],
		commission: '35%',
		active: true,
	},
	{
		id: 'diego-staff',
		name: 'Diego',
		initials: 'DS',
		role: 'Barbero',
		color: '#b875d8',
		services: ['Corte clasico', 'Barba'],
		commission: '28%',
		active: true,
	},
	{
		id: 'sofia-staff',
		name: 'Sofia',
		initials: 'SV',
		role: 'Barbera',
		color: '#dc78c8',
		services: ['Corte premium', 'Barba'],
		commission: '40%',
		active: true,
	},
];
export const mockServices: MockService[] = [
	{
		id: 'classic',
		name: 'Corte clasico',
		description: 'Corte masculino clasico con perfilado basico.',
		duration: 30,
		price: 45,
		appointments: 18,
	},
	{
		id: 'combo',
		name: 'Corte + barba',
		description: 'Servicio combinado de corte y barba.',
		duration: 45,
		price: 78,
		appointments: 12,
	},
	{
		id: 'beard',
		name: 'Barba',
		description: 'Perfilado, recorte y acabado de barba.',
		duration: 30,
		price: 35,
		appointments: 9,
	},
	{
		id: 'premium',
		name: 'Corte premium',
		description: 'Corte + lavado + acabado con styling.',
		duration: 60,
		price: 65,
		appointments: 7,
	},
];
export const mockAppointments: MockAppointment[] = [
	{
		id: 'a1',
		client: 'Juan Perez',
		serviceId: 'classic',
		staffId: 'carlos-staff',
		start: '09:30',
		end: '10:00',
		status: 'confirmed',
		weekday: 0,
	},
	{
		id: 'a2',
		client: 'Carlos Rodriguez',
		serviceId: 'combo',
		staffId: 'carlos-staff',
		start: '10:30',
		end: '11:15',
		status: 'pending',
		weekday: 4,
	},
	{
		id: 'a3',
		client: 'Andres Gomez',
		serviceId: 'premium',
		staffId: 'carlos-staff',
		start: '13:00',
		end: '14:00',
		status: 'confirmed',
		weekday: 5,
	},
	{
		id: 'a4',
		client: 'Mateo Sanchez',
		serviceId: 'beard',
		staffId: 'diego-staff',
		start: '09:00',
		end: '09:30',
		status: 'completed',
		weekday: 1,
	},
	{
		id: 'a5',
		client: 'Sebastian Torres',
		serviceId: 'classic',
		staffId: 'diego-staff',
		start: '10:00',
		end: '10:30',
		status: 'confirmed',
		weekday: 4,
	},
	{
		id: 'a6',
		client: 'Juan Perez',
		serviceId: 'premium',
		staffId: 'diego-staff',
		start: '14:00',
		end: '15:00',
		status: 'pending',
		weekday: 3,
	},
	{
		id: 'a7',
		client: 'Carlos Rodriguez',
		serviceId: 'combo',
		staffId: 'sofia-staff',
		start: '09:30',
		end: '10:15',
		status: 'confirmed',
		weekday: 5,
	},
	{
		id: 'a8',
		client: 'Andres Gomez',
		serviceId: 'classic',
		staffId: 'sofia-staff',
		start: '11:00',
		end: '11:30',
		status: 'confirmed',
		weekday: 2,
	},
	{
		id: 'a9',
		client: 'Mateo Sanchez',
		serviceId: 'premium',
		staffId: 'sofia-staff',
		start: '15:00',
		end: '16:00',
		status: 'completed',
		weekday: 5,
	},
];
export const weekDays = [
	{ label: 'LUN', date: '31' },
	{ label: 'MAR', date: '1' },
	{ label: 'MIE', date: '2' },
	{ label: 'JUE', date: '3' },
	{ label: 'VIE', date: '4' },
	{ label: 'SAB', date: '5' },
	{ label: 'DOM', date: '6' },
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
export const agendaSidebarItems: AgendaSidebarItem[] = [
	{ id: 'agenda', label: 'Agenda' },
	{ id: 'personal', label: 'Equipo' },
	{ id: 'clientes', label: 'Clientes' },
	{ id: 'servicios', label: 'Servicios' },
	{ id: 'analiticas', label: 'Analiticas' },
	{ id: 'configuracion', label: 'Configuracion' },
];
export const whatsappMessages = [
	{
		from: 'Cliente',
		text: 'Hola, quiero reservar para manana',
		bubble: 'bubble-white',
	},
	{
		from: 'Polaria',
		text: 'Hola! Que servicio te gustaria agendar?',
		bubble: 'bubble-green',
	},
	{ from: 'Cliente', text: 'Corte clasico', bubble: 'bubble-white' },
	{
		from: 'Polaria',
		text: 'Estos son los horarios disponibles:\n10:00 · 12:30 · 16:30',
		bubble: 'bubble-green',
	},
	{ from: 'Cliente', text: '16:30', bubble: 'bubble-white' },
	{
		from: 'Polaria',
		text: 'Listo! Tu turno quedo agendado.\nCorte clasico · manana 16:30',
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
		description: 'El bot lee tu agenda real y propone opciones en segundos.',
	},
	{
		index: '03',
		title: 'El cliente elige',
		description: 'Solo tiene que responder con la hora o servicio preferido.',
	},
	{
		index: '04',
		title: 'Cita organizada',
		description: 'Se crea automaticamente en tu agenda y recibe confirmacion.',
	},
];
export const simpleSteps = [
	{
		index: '01',
		title: 'Configura tu negocio',
		description: 'Registra servicios, equipo y horarios de trabajo.',
	},
	{
		index: '02',
		title: 'Comparte tu link o WhatsApp',
		description: 'Recibe turnos en piloto automatico.',
	},
	{
		index: '03',
		title: 'Gestiona todo en un solo lugar',
		description: 'Controla tu flujo diario desde el panel administrativo.',
	},
];
