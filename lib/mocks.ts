export const APPOINTMENT_STATUS = {
	CONFIRMED: 'confirmed',
	COMPLETED: 'completed',
	CANCELLED: 'cancelled',
} as const;

export const STATUS_COLORS = {
	confirmed: {
		badge: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200',
		dot: 'bg-blue-500',
	},
	completed: {
		badge: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200',
		dot: 'bg-green-500',
	},
	cancelled: {
		badge: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200',
		dot: 'bg-red-500',
	},
} as const;

export const DEFAULT_SLOT_DURATION = 30; // minutes

export const WORKING_DAYS = [
	'Lunes',
	'Martes',
	'Miércoles',
	'Jueves',
	'Viernes',
	'Sábado',
	'Domingo',
];

export const DEFAULT_SETTINGS = {
	barbershopName: 'Barbershop',
	workingDays: [true, true, true, true, true, true, false], // Mon-Sat, closed Sunday
	openingHours: { from: '09:00', to: '18:00' },
	appointmentSlotDuration: DEFAULT_SLOT_DURATION,
};

// Mock data
export const MOCK_STAFF = [
	{
		id: '1',
		name: 'John Smith',
		active: true,
		services: ['Corte de Cabello', 'Recorte de Barba'],
	},
	{
		id: '2',
		name: 'Mike Johnson',
		active: true,
		services: ['Corte de Cabello', 'Estilo', 'Recorte de Barba'],
	},
	{ id: '3', name: 'David Lee', active: false, services: ['Corte de Cabello'] },
];

export const MOCK_SERVICES = [
	{ id: '1', name: 'Corte de Cabello', durationMinutes: 30, price: 20 },
	{ id: '2', name: 'Recorte de Barba', durationMinutes: 15, price: 15 },
	{ id: '3', name: 'Estilo', durationMinutes: 45, price: 25 },
	{ id: '4', name: 'Servicio Completo', durationMinutes: 60, price: 35 },
];

export const MOCK_APPOINTMENTS = [
	{
		id: '1',
		clientName: 'Robert Brown',
		time: new Date(new Date().setHours(9, 0, 0, 0)),
		service: 'Corte de Cabello',
		barber: 'John Smith',
		status: 'confirmed' as const,
		duration: 30,
	},
	{
		id: '2',
		clientName: 'James Wilson',
		time: new Date(new Date().setHours(9, 45, 0, 0)),
		service: 'Recorte de Barba',
		barber: 'Mike Johnson',
		status: 'confirmed' as const,
		duration: 15,
	},
	{
		id: '3',
		clientName: 'Charles Martinez',
		time: new Date(new Date().setHours(10, 30, 0, 0)),
		service: 'Estilo',
		barber: 'John Smith',
		status: 'confirmed' as const,
		duration: 45,
	},
	{
		id: '4',
		clientName: 'Thomas Anderson',
		time: new Date(new Date().setHours(14, 0, 0, 0)),
		service: 'Servicio Completo',
		barber: 'Mike Johnson',
		status: 'completed' as const,
		duration: 60,
	},
	{
		id: '5',
		clientName: 'Daniel Garcia',
		time: new Date(new Date().setHours(15, 15, 0, 0)),
		service: 'Corte de Cabello',
		barber: 'John Smith',
		status: 'cancelled' as const,
		duration: 30,
	},
];

export const mockAIResponses = [
	'Hola, soy tu asistente de barbería. ¿En qué puedo ayudarte?',
	'Claro, podemos ayudarte a agendar una cita. ¿Qué día prefieres?',
	'Tenemos cortes disponibles a las 10:00, 14:00 y 16:00 horas.',
	'Perfecto, anotaré tu cita para el día indicado. ¿A nombre de quién?',
	'Los servicios disponibles son: Corte ($15), Afeitado ($10), Peinado ($20) y Servicio Completo ($35).',
	'Nuestro horario es de lunes a sábado de 9:00 a 18:00 horas.',
	'¿Hay algo más en lo que pueda asistirte?',
	'Nos encantaría verte pronto en nuestra barbería.',
	'Puedo ayudarte con información sobre servicios, horarios o reservas.',
	'El tiempo estimado para un corte es aproximadamente 30 minutos.',
	'Aceptamos pagos en efectivo y tarjeta.',
	'Nuestro equipo de barberos expertos te dará un excelente servicio.',
];

export function getRandomAIResponse(): string {
	return mockAIResponses[Math.floor(Math.random() * mockAIResponses.length)];
}
