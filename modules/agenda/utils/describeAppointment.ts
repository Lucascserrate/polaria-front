/**
 * De qué cita se está hablando, para el aviso de cancelar.
 *
 * Los dos datos son opcionales porque no siempre están: una reserva sin cliente
 * cargado, o una cita vieja sin hora. Lo que falta se cae de la frase en vez de
 * escribirse vacío —"La cita de a las" no dice nada y parece un error—.
 */
const describeAppointment = (
	clientName?: string | null,
	timeLabel?: string | null,
) =>
	[
		clientName ? `La cita de ${clientName}` : 'La cita',
		timeLabel && ` a las ${timeLabel}`,
	]
		.filter(Boolean)
		.join('');

export default describeAppointment;
