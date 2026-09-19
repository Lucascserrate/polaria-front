'use client';

import { useEffect, useRef, useState } from 'react';

/** Marca un elemento como destino de arrastre. El valor es a dónde va. */
export const DROP_ATTRIBUTE = 'data-drop-category';

type Dragged = { id: string; name: string };

/**
 * Arrastrar un servicio hasta una categoría.
 *
 * Con eventos de puntero y no con el arrastre nativo de HTML5. El nativo es
 * menos código, pero **no existe en táctil**: en el iPad con el que se muestra
 * el panel no pasaría nada al arrastrar. `pointermove` es el mismo camino para
 * el mouse y para el dedo.
 *
 * El destino se resuelve con `elementFromPoint` en lugar de poner un `onDragOver`
 * en cada categoría: así el listado no tiene que saber quiénes son los destinos
 * ni pasarles nada, y agregar uno nuevo es ponerle el atributo.
 *
 * Los listeners van en `window` y no en el elemento: el puntero se sale del
 * servicio apenas empieza el movimiento, y si escucháramos ahí el arrastre se
 * cortaría en el primer píxel.
 *
 * No apaga la selección de texto: eso lo hace la pantalla con `select-none`, y
 * tiene que estar puesto **antes** de que alguien apriete, no cuando el arrastre
 * ya arrancó.
 */
const useServiceDrag = (
	onDrop: (serviceId: string, target: string) => void,
) => {
	const [dragging, setDragging] = useState<Dragged | null>(null);
	const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
	const [over, setOver] = useState<string | null>(null);

	/*
	 * El destino y el callback viven también en refs porque el listener se
	 * registra una sola vez por arrastre: leerlos del estado dejaría al `pointerup`
	 * mirando el valor que había cuando empezó, o sea siempre ninguno.
	 */
	const overRef = useRef<string | null>(null);
	const onDropRef = useRef(onDrop);

	// En un efecto y no durante el render: escribir una ref mientras se renderiza
	// es lo que React pide no hacer, y acá no hace falta — el arrastre termina
	// bastante después de cualquier render.
	useEffect(() => {
		onDropRef.current = onDrop;
	});

	const start = (event: React.PointerEvent, service: Dragged) => {
		// Sin esto el navegador selecciona texto y, en el móvil, desplaza la página.
		event.preventDefault();
		setDragging(service);
		setPoint({ x: event.clientX, y: event.clientY });
	};

	useEffect(() => {
		if (!dragging) return;

		const move = (event: PointerEvent) => {
			setPoint({ x: event.clientX, y: event.clientY });

			const element = document.elementFromPoint(event.clientX, event.clientY);
			const target =
				element?.closest(`[${DROP_ATTRIBUTE}]`)?.getAttribute(DROP_ATTRIBUTE) ??
				null;

			overRef.current = target;
			setOver(target);
		};

		const end = () => {
			if (overRef.current) onDropRef.current(dragging.id, overRef.current);
			overRef.current = null;
			setDragging(null);
			setOver(null);
			setPoint(null);
		};

		window.addEventListener('pointermove', move);
		window.addEventListener('pointerup', end);
		// Soltar fuera de la ventana, o que el sistema se quede con el gesto, tiene
		// que terminar el arrastre igual: si no, queda un fantasma pegado al cursor.
		window.addEventListener('pointercancel', end);

		return () => {
			window.removeEventListener('pointermove', move);
			window.removeEventListener('pointerup', end);
			window.removeEventListener('pointercancel', end);
		};
	}, [dragging]);

	return { dragging, over, point, start };
};

export default useServiceDrag;
