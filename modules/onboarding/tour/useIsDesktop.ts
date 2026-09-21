'use client';

import { useEffect, useState } from 'react';

/** El mismo corte que usa Tailwind para `md:`. */
const DESKTOP = '(min-width: 768px)';

/**
 * Si hay pantalla grande.
 *
 * El tutorial guiado la pide: ilumina el menú lateral, el nav del editor y el
 * calendario a la vez que muestra un cartel al lado, y en un teléfono eso son
 * tres cosas que no coexisten —el menú es un cajón, el editor es una fila con
 * scroll y el cartel taparía justo lo que hay que tocar—. En móvil la lección se
 * ofrece igual, pero como enlace directo a la pantalla.
 *
 * Arranca en `false` y se corrige después de montar: en el primer render del
 * servidor no hay ventana que medir, y suponer escritorio dibujaría un tutorial
 * que en un teléfono hay que sacar enseguida.
 */
export const useIsDesktop = (): boolean => {
	const [desktop, setDesktop] = useState(false);

	useEffect(() => {
		const query = window.matchMedia(DESKTOP);
		const sync = () => setDesktop(query.matches);

		sync();
		query.addEventListener('change', sync);
		return () => query.removeEventListener('change', sync);
	}, []);

	return desktop;
};
