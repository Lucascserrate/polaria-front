import type { AnchorRect } from './useAnchorRect';

/** El ancho del cartel. Fijo: un cartel que cambia de ancho por paso se lee peor. */
export const CALLOUT_WIDTH = 320;

/** Lo que el cartel se despega de lo iluminado, y del borde de la ventana. */
const GAP = 14;
const MARGIN = 16;

export interface Viewport {
	width: number;
	height: number;
}

export interface Placement {
	top: number;
	left: number;
}

const clamp = (value: number, min: number, max: number) =>
	Math.min(Math.max(value, min), Math.max(min, max));

/**
 * Dónde poner el cartel para que no tape lo que está señalando.
 *
 * Prueba los cuatro costados en orden y se queda con el primero donde entra
 * entero. Derecha primero porque lo que más se ilumina son filas de menú y
 * botones de encabezado, que dejan libre el costado; abajo después, que es donde
 * cae naturalmente la vista.
 *
 * Si no entra en ninguno —un formulario que ocupa casi toda la ventana— baja al
 * pie de la pantalla, no al centro. El centro es justo donde están los campos
 * que el paso está pidiendo llenar, y un cartel ahí deja al usuario mirando la
 * instrucción sin poder ejecutarla; abajo tapa el espacio muerto que casi
 * siempre queda al final del formulario.
 */
export const placeCallout = (
	rect: AnchorRect | null,
	calloutHeight: number,
	viewport: Viewport,
	/**
	 * Dónde cae cuando no hay nada que señalar.
	 *
	 * `center` es para las tarjetas que sólo se leen —el "lección completa"—, que
	 * abajo quedarían escondidas. `bottom` es para un paso cuyo anclaje
	 * desapareció: algo lo reemplazó en pantalla, y el centro es justo donde ese
	 * algo está.
	 */
	fallback: 'center' | 'bottom' = 'center',
): Placement => {
	const horizontallyCentered = (viewport.width - CALLOUT_WIDTH) / 2;

	if (!rect) {
		return {
			left: horizontallyCentered,
			top:
				fallback === 'bottom'
					? Math.max(MARGIN, viewport.height - calloutHeight - MARGIN)
					: Math.max(MARGIN, (viewport.height - calloutHeight) / 2),
		};
	}

	const verticallyBeside = clamp(
		rect.top + rect.height / 2 - calloutHeight / 2,
		MARGIN,
		viewport.height - calloutHeight - MARGIN,
	);
	const horizontallyAligned = clamp(
		rect.left,
		MARGIN,
		viewport.width - CALLOUT_WIDTH - MARGIN,
	);

	const right = rect.left + rect.width + GAP;
	if (right + CALLOUT_WIDTH + MARGIN <= viewport.width) {
		return { left: right, top: verticallyBeside };
	}

	const below = rect.top + rect.height + GAP;
	if (below + calloutHeight + MARGIN <= viewport.height) {
		return { left: horizontallyAligned, top: below };
	}

	const above = rect.top - GAP - calloutHeight;
	if (above >= MARGIN) {
		return { left: horizontallyAligned, top: above };
	}

	const left = rect.left - GAP - CALLOUT_WIDTH;
	if (left >= MARGIN) {
		return { left, top: verticallyBeside };
	}

	return {
		left: horizontallyCentered,
		top: Math.max(MARGIN, viewport.height - calloutHeight - MARGIN),
	};
};
