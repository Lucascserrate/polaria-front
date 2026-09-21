'use client';

import { useEffect, useState } from 'react';
import { findAnchor, type TourAnchor } from './anchors';

/**
 * Lo que un paso necesita antes de dejar seguir.
 *
 * `enabled` mira si un control dejó de estar deshabilitado, y en la práctica ese
 * control es el botón de guardar del formulario. Es a propósito: el editor ya
 * calcula si lo cargado alcanza —lo necesita para su propio botón— y esa cuenta
 * está escrita en un solo lugar. Revalidar acá sería una segunda opinión sobre
 * lo mismo, y el día que cambie una regla van a quedar en desacuerdo sin que
 * nadie se entere.
 *
 * `filled` es para los pasos donde el formulario todavía no tiene veredicto
 * porque falta cargar lo de las otras solapas: ahí no se puede preguntar "¿está
 * completo?" sino "¿escribió esto?".
 *
 * `absent` es al revés: se cumple cuando el anclaje **ya no está**. Sirve para
 * los pasos que terminan cerrando algo —un cajón que se va al guardar—, donde la
 * desaparición es la prueba de que la acción ocurrió.
 */
export interface StepRequirement {
	anchor: TourAnchor;
	kind: 'enabled' | 'filled' | 'absent';
}

const CHECKBOXES = '[role="checkbox"], input[type="checkbox"]';
const CHECKED =
	'[role="checkbox"][aria-checked="true"], input[type="checkbox"]:checked';
const TEXT_FIELDS =
	'input:not([type="checkbox"]):not([type="radio"]), textarea';

/**
 * Si hay algo cargado adentro.
 *
 * Con casillas adentro, "cargado" es tener al menos una tildada y los campos de
 * texto no cuentan: la sección de servicios de un profesional tiene un buscador,
 * y escribir en el buscador no es elegir un servicio —era justo la forma de
 * pasar el paso sin haberlo hecho—.
 *
 * Sin casillas, "cargado" es que no quede ningún campo vacío. Los anclajes de
 * este tipo envuelven un campo puntual, no un formulario entero, así que exigir
 * todos no exige de más.
 */
const isFilled = (root: HTMLElement): boolean => {
	if (root.querySelectorAll(CHECKBOXES).length > 0) {
		return root.querySelector(CHECKED) !== null;
	}

	const fields = Array.from(
		root.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(TEXT_FIELDS),
	).filter((field) => !field.disabled);

	return (
		fields.length > 0 && fields.every((field) => field.value.trim() !== '')
	);
};

const isSatisfied = (requirement: StepRequirement): boolean => {
	const element = findAnchor(requirement.anchor);

	if (requirement.kind === 'absent') return element === null;

	// Sin el elemento no hay nada que mirar, y dar por buena una condición que no
	// se pudo evaluar es lo que deja pasar al paso siguiente con el campo vacío.
	if (!element) return false;

	return requirement.kind === 'enabled'
		? !(element as HTMLButtonElement).disabled
		: isFilled(element);
};

/**
 * Si el paso ya puede darse por terminado.
 *
 * Mide por cuadro, como el resto del tutorial: lo que cambia la respuesta es que
 * el usuario escriba o tilde algo, y no hay un evento al que suscribirse que
 * valga para los dos casos ni para controles que viven en otro componente.
 *
 * Sin condición, siempre `true`: la mayoría de los pasos no pide nada.
 */
export const useRequirementMet = (
	requirement: StepRequirement | undefined,
	resetKey: number,
): boolean => {
	const [met, setMet] = useState(true);

	useEffect(() => {
		let frame = 0;
		let previous: boolean | null = null;

		const tick = () => {
			const now = requirement ? isSatisfied(requirement) : true;

			if (previous !== now) {
				previous = now;
				setMet(now);
			}

			frame = requestAnimationFrame(tick);
		};

		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [requirement, resetKey]);

	return met;
};
