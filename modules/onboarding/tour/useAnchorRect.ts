'use client';

import { useEffect, useState } from 'react';
import { findAnchor, type TourAnchor } from './anchors';

export interface AnchorRect {
	top: number;
	left: number;
	width: number;
	height: number;
}

const rectOf = (element: HTMLElement): AnchorRect => {
	const box = element.getBoundingClientRect();
	return {
		top: box.top,
		left: box.left,
		width: box.width,
		height: box.height,
	};
};

const same = (a: AnchorRect | null, b: AnchorRect | null) =>
	a === b ||
	(a !== null &&
		b !== null &&
		a.top === b.top &&
		a.left === b.left &&
		a.width === b.width &&
		a.height === b.height);

/**
 * Dónde está, cuadro a cuadro, el elemento que el tutorial ilumina.
 *
 * Se mide por cuadro y no con un `ResizeObserver` porque lo que se persigue no
 * es sólo el tamaño: el elemento se mueve cuando el cajón de la reserva entra
 * deslizándose, cuando la página scrollea, cuando el menú se colapsa. Un
 * observador por cada una de esas causas sería más código y llegaría tarde a la
 * que falte.
 *
 * El estado sólo cambia cuando el rectángulo cambió de verdad, así que el bucle
 * no redibuja nada mientras la pantalla está quieta. Y sólo corre mientras hay
 * una lección abierta: fuera del tutorial no hay anclaje que medir.
 */
export const useAnchorRect = (name?: TourAnchor): AnchorRect | null => {
	const [rect, setRect] = useState<AnchorRect | null>(null);

	useEffect(() => {
		let frame = 0;
		let measured = false;
		let previous: AnchorRect | null = null;

		const measure = () => {
			const element = name ? findAnchor(name) : null;
			const next = element ? rectOf(element) : null;

			/*
			 * La primera medición se publica siempre, aunque dé `null`: el estado
			 * todavía tiene el rectángulo del anclaje anterior, y compararlo contra
			 * el `previous` recién inicializado lo daría por bueno.
			 */
			if (!measured || !same(previous, next)) {
				measured = true;
				previous = next;
				setRect(next);
			}

			frame = requestAnimationFrame(measure);
		};

		frame = requestAnimationFrame(measure);
		return () => cancelAnimationFrame(frame);
	}, [name]);

	return rect;
};
