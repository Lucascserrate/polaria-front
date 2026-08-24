'use client';

interface Props {
	/** El borrador tiene un servicio que ya no está activo. */
	hasInactiveService: boolean;
	/** Con los servicios elegidos, el horario ya no entra. */
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
			<p className="text-xs text-amber-600 dark:text-amber-500">
				Hay un servicio de esta reserva que ya no está activo. Para guardar
				cambios hay que quitarlo.
			</p>
		)}

		{timeNoLongerFits && (
			<p className="text-xs text-amber-600 dark:text-amber-500">
				Con estos servicios ese horario ya no entra. Elegí otra hora para poder
				guardar.
			</p>
		)}

		{pendingChanges && (
			<p className="text-xs text-muted-foreground">
				Las horas de cada servicio se reacomodan al guardar.
			</p>
		)}

		{locked && (
			<p className="text-xs text-amber-600 dark:text-amber-500">
				Esta reserva tiene un servicio sin profesional asignado, así que no se
				puede editar desde acá.
			</p>
		)}
	</>
);

export default BookingNotices;
