export const DEFAULT_SLOT_DURATION = 30;

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
	polariaName: 'PolariaName',
	workingDays: [true, true, true, true, true, true, false],
	openingHours: { from: '09:00', to: '18:00' },
	appointmentSlotDuration: DEFAULT_SLOT_DURATION,
};
