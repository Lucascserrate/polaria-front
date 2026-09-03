'use client';

interface Props {
	/** El borrador tiene un servicio que ya no está activo. */
	hasInactiveService: boolean;
	/** Con los servicios elegidos, el horario dejó de estar disponible. */
	timeNoLongerFits: boolean;
	/** Hay cambios sin guardar y el horario sigue siendo válido. */
	pendingChanges: boolean;
	/** La reserva no se puede editar desde acá. */
	locked: boolean;
}

/**
 * Lo que hay que decir antes de guardar.
 *
 * Están juntos y en un solo lugar porque se leen como un grupo: son las razones
 * por las que guardar puede no estar disponible, o por las que el resultado no va
 * a ser exactamente lo que se ve. Repartidos entre los campos, el que impide
 * guardar podía quedar fuera de la pantalla.
 */
const BookingNotices: React.FC<Props> = ({
	hasInactiveService,
	timeNoLongerFits,
	pendingChanges,
	locked,
}) => (
	<>
		{hasInactiveService && (
			<p className="text-xs text-warning">
				Hay un servicio de esta reserva que ya no está activo. Para guardar
				cambios hay que quitarlo.
			</p>
		)}

		{/*
		 * Avisa, no impide. Alargar la reserva de alguien que ya está en la silla
		 * hasta pasarse de la hora de cierre es algo que un negocio hace, y el panel
		 * es la herramienta de quien puede decidirlo. Al guardar, el backend
		 * responde qué tiene de raro exactamente —fuera de horario, fuera de
		 * jornada, pisado con otra cita— y eso se muestra en la agenda.
		 */}
		{timeNoLongerFits && (
			<p className="text-xs text-warning">
				Con estos servicios ese horario deja de estar disponible. Se puede
				guardar igual: al hacerlo te decimos qué queda fuera.
			</p>
		)}

		{pendingChanges && (
			<p className="text-xs text-muted-foreground">
				Las horas de cada servicio se reacomodan al guardar.
			</p>
		)}

		{locked && (
			<p className="text-xs text-warning">
				Esta reserva tiene un servicio sin profesional asignado, así que no se
				puede editar desde acá.
			</p>
		)}
	</>
);

export default BookingNotices;
