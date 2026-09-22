'use client';

import { Button } from '@/components/ui/button';

/**
 * Cuántos servicios hay dados de baja, al final del catálogo.
 *
 * Es la única señal de que existen, y va abajo a propósito: el catálogo contesta
 * "qué ofrece el negocio hoy", así que lo dado de baja no puede estar arriba
 * compitiendo con lo vigente. Pero tampoco puede no estar en ninguna parte, que
 * es lo que pasaba antes: el servicio desactivado desaparecía de todas las
 * pantallas y no había forma de saber que seguía existiendo ni de volverlo a
 * activar.
 *
 * Sin ninguno desactivado no se dibuja nada. Un renglón que dice "0 servicios
 * desactivados" ocupa lugar para informar de algo que no pasó.
 */
const InactiveServicesBar: React.FC<{
	count: number;
	/** Si el catálogo los está mostrando ahora mismo. */
	showing: boolean;
	onToggle: () => void;
}> = ({ count, showing, onToggle }) => {
	if (count === 0) return null;

	return (
		<div className="flex items-center gap-1 border-t border-border pt-3 text-sm text-muted-foreground">
			<p>
				{count === 1
					? '1 servicio desactivado.'
					: `${count} servicios desactivados.`}
			</p>

			<Button
				variant="link"
				size="sm"
				className="h-auto p-0 text-sm cursor-pointer"
				onClick={onToggle}
			>
				{showing ? 'Ocultar' : 'Ver todo'}
			</Button>
		</div>
	);
};

export default InactiveServicesBar;
