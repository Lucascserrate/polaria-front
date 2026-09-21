'use client';

import { useEffect, useRef } from 'react';
import { countAnchors, type TourAnchor } from './anchors';

/**
 * Avisa cuando **aparece** uno más, una sola vez.
 *
 * Cuenta en lugar de preguntar si existe. Es lo que distingue "creá la reserva"
 * en una agenda vacía —donde la tarjeta pasa de no estar a estar— de la misma
 * frase en una agenda que ya tiene citas de otro día, donde el anclaje está
 * desde antes y su presencia no prueba que el usuario haya hecho nada. Lo que
 * prueba que hizo algo es que ahora hay una más.
 *
 * Si la cuenta baja, esa pasa a ser la referencia: volver atrás y rehacer la
 * acción tiene que seguir contando como aparición.
 *
 * Mira el DOM por cuadro en lugar de observar mutaciones porque el anclaje puede
 * nacer en otra pantalla, dentro de un portal o después de una navegación: un
 * `MutationObserver` habría que colgarlo del contenedor correcto, y el correcto
 * cambia con el paso.
 *
 * Avisa por callback y no devolviendo un booleano para no tener que apagar ese
 * booleano en el paso siguiente: el estado que habría que reiniciar es
 * justamente el que este bucle ya tiene adentro.
 *
 * @param resetKey Reinicia la observación aunque el anclaje sea el mismo. Es el
 * número de paso: dos pasos seguidos podrían esperar lo mismo por motivos
 * distintos.
 */
export const useAnchorAppears = (
	name: TourAnchor | undefined,
	resetKey: number,
	onAppear: () => void,
): void => {
	// El callback cambia de identidad en cada render; el bucle no puede
	// reiniciarse por eso, así que lee siempre el último a través de la caja.
	const latest = useRef(onAppear);
	useEffect(() => {
		latest.current = onAppear;
	}, [onAppear]);

	useEffect(() => {
		if (!name) return;

		// La foto del arranque: lo que ya estaba no cuenta como aparición.
		let baseline = countAnchors(name);
		let frame = 0;

		const tick = () => {
			const count = countAnchors(name);

			if (count > baseline) {
				latest.current();
				return;
			}

			baseline = Math.min(baseline, count);
			frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [name, resetKey]);
};
