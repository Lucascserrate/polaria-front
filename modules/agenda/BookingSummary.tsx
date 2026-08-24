'use client';

interface Props {
	totalMinutes: number;
	totalPrice: number;
}

/**
 * Cuánto dura y cuánto sale la reserva.
 *
 * Vive en el pie porque es la consecuencia de todo lo elegido arriba, y mientras
 * hay cambios sin guardar muestra el total del borrador: si mostrara el guardado,
 * agregar un servicio no cambiaría el número y el precio que se lee no sería el
 * que se va a cobrar.
 */
const BookingSummary: React.FC<Props> = ({ totalMinutes, totalPrice }) => (
	<div className="text-sm">
		<span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
			Total · {totalMinutes} min
		</span>
		<p className="text-base font-semibold tabular-nums">{totalPrice}</p>
	</div>
);

export default BookingSummary;
