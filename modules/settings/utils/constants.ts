export const SETTINGS_KEY = ['settings'] as const;

export const DEFAULT_SLOT_DURATION = 30;

export const DEFAULT_SETTINGS = {
	polariaName: 'PolariaName',
	appointmentSlotDuration: DEFAULT_SLOT_DURATION,
};

/**
 * Semana con la que arranca un negocio que todavía no cargó horarios: de lunes
 * a sábado, de 09:00 a 18:00.
 *
 * Es una propuesta editable, no un valor guardado —la base sigue vacía hasta
 * que el dueño confirma—, y existe para que la primera visita a Configuración
 * muestre algo que ajustar en vez de siete días cerrados.
 */
export const DEFAULT_BUSINESS_HOURS = [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({
	dayOfWeek,
	startTime: '09:00',
	endTime: '18:00',
}));
