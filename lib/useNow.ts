'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * Reloj que avanza mientras la pantalla está abierta.
 *
 * Va con `useSyncExternalStore` y no con `useState` + `useEffect` porque el
 * tiempo es exactamente eso: una fuente externa que cambia sola. Además resuelve
 * dos problemas de la versión con estado:
 *
 * - **Hidratación.** En el servidor devuelve `0`, así que lo que se dibuja al
 *   prerenderizar coincide con lo que dibuja el navegador antes de montar. Con
 *   `Date.now()` de valor inicial, el servidor y el cliente calculaban la
 *   posición de la línea con relojes distintos y React reportaba desajuste.
 * - **Reanudar.** Al pasar de una fecha pasada al día de hoy, `enabled` cambia y
 *   el valor se recalcula al instante, sin esperar hasta un minuto al próximo
 *   tick.
 *
 * Devuelve `0` mientras no haya montado; quien lo use debe tratar ese valor como
 * "todavía no hay hora".
 */
const useNow = (intervalMs = 60_000, enabled = true): number => {
	const subscribe = useCallback(
		(onStoreChange: () => void) => {
			// Sin intervalo cuando no hace falta: la línea de "ahora" solo existe en
			// el día de hoy, y un temporizador para una fecha pasada es trabajo que
			// nadie mira.
			if (!enabled) return () => {};

			const timer = setInterval(onStoreChange, intervalMs);
			return () => clearInterval(timer);
		},
		[enabled, intervalMs],
	);

	return useSyncExternalStore(
		subscribe,
		// Redondeado al intervalo a propósito: `getSnapshot` tiene que devolver el
		// mismo valor entre tick y tick, y `Date.now()` crudo cambia en cada
		// llamada, con lo que React vuelve a renderizar sin parar.
		useCallback(
			() => Math.floor(Date.now() / intervalMs) * intervalMs,
			[intervalMs],
		),
		() => 0,
	);
};

export default useNow;
