'use client';

import { useMemo, useState } from 'react';
import type { ServiceCategory } from '@/types/service-categories.types';

export type CategorySection = 'details' | 'scheduling';

/**
 * Lo que aguantan las columnas de la categoría, iguales a las del DTO.
 *
 * Se repite acá por lo mismo que en el servicio: el punto es que el límite se
 * vea **mientras se escribe**, y no enterarse al guardar con un error que no
 * dice qué campo era.
 */
export const CATEGORY_TEXT_MAX_LENGTH = 255;

export interface CategoryDraft {
	name: string;
	description: string;
	/**
	 * Con qué otras categorías se puede atender ésta al mismo tiempo.
	 *
	 * Vive en el mismo borrador que el nombre aunque el servidor las guarde en
	 * otra tabla y con otra llamada: para quien edita es una sola pantalla y un
	 * solo guardado, y partir el estado en dos haría que "guardar" significara
	 * dos cosas distintas según la sección en la que estuviera parado.
	 */
	parallelCategoryIds: string[];
}

/** Lo que se manda a guardar, ya limpio. */
export interface CategoryPayload {
	name: string;
	/**
	 * Ya recortada, y **vacía si se borró**.
	 *
	 * No se convierte a `undefined` acá: en una edición, un campo ausente es un
	 * campo que no se tocó, así que borrar la descripción no la borraría nunca.
	 * Quién decide qué hacer con la cadena vacía es cada pantalla, y el servidor
	 * la guarda como `NULL`.
	 */
	description: string;
	parallelCategoryIds: string[];
}

export interface CategoryDraftState {
	draft: CategoryDraft;
	set: <K extends keyof CategoryDraft>(key: K, value: CategoryDraft[K]) => void;
	/** Qué falta resolver en cada sección, para marcarla en el nav. */
	errors: Partial<Record<CategorySection, string>>;
	canSave: boolean;
	toPayload: () => CategoryPayload;
}

/**
 * El estado del editor de una categoría.
 *
 * Toda la categoría en un objeto y no un estado por sección, igual que en el
 * editor de servicios: la pantalla se **recorre** por secciones pero se guarda de
 * una sola vez, y el botón de la cabecera tiene que poder mandar todo sin
 * preguntarle a nadie dónde estaba parado el usuario.
 */
const useCategoryDraft = (
	category?: ServiceCategory | null,
	/** Las que ya estaban marcadas. Vacío al crear. */
	parallelCategoryIds: string[] = [],
): CategoryDraftState => {
	const [draft, setDraft] = useState<CategoryDraft>(() => ({
		name: category?.name ?? '',
		description: category?.description ?? '',
		parallelCategoryIds,
	}));

	const set = <K extends keyof CategoryDraft>(
		key: K,
		value: CategoryDraft[K],
	) => setDraft((current) => ({ ...current, [key]: value }));

	const errors = useMemo<Partial<Record<CategorySection, string>>>(() => {
		const found: Partial<Record<CategorySection, string>> = {};

		if (!draft.name.trim()) {
			found.details = 'Poné un nombre para la categoría.';
		}

		/*
		 * La sección de simultaneidad no puede quedar mal: son casillas, y ninguna
		 * combinación de casillas es inválida. Se deja escrito porque su ausencia
		 * de la lista se lee como un olvido.
		 */

		return found;
	}, [draft.name]);

	return {
		draft,
		set,
		errors,
		canSave: Object.keys(errors).length === 0,
		toPayload: () => ({
			name: draft.name.trim(),
			description: draft.description.trim(),
			parallelCategoryIds: draft.parallelCategoryIds,
		}),
	};
};

export default useCategoryDraft;
