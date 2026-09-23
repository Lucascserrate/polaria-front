'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { ROUTES } from '@/constants/routes';
import CategoryEditor from '@/modules/services/CategoryEditor';
import type { CategoryPayload } from '@/modules/services/useCategoryDraft';
import useGetServiceCategories from '@/services/service-categories/useGetServiceCategories';
import useCreateServiceCategory from '@/services/service-categories/useCreateServiceCategory';
import useSetParallelCategories from '@/services/service-categories/useSetParallelCategories';

const messageOf = (cause: unknown, fallback: string): string =>
	axios.isAxiosError(cause) && typeof cause.response?.data?.message === 'string'
		? cause.response.data.message
		: fallback;

const NewCategoryPage = () => {
	const router = useRouter();
	const { data: categories = [] } = useGetServiceCategories();
	const createCategory = useCreateServiceCategory();
	const setParallel = useSetParallelCategories();
	const [error, setError] = useState<string | null>(null);

	/**
	 * Crear y, si se marcó algo, guardar con qué convive.
	 *
	 * Son dos llamadas porque las reglas se escriben por categoría y hasta que no
	 * existe no tiene id. Para quien la está creando sigue siendo un solo botón,
	 * que es lo que importa: marcar la casilla y que después haya que entrar de
	 * nuevo para que surta efecto sería pedirle que se acuerde.
	 *
	 * Si la segunda falla, la categoría **ya existe**: se queda en la pantalla con
	 * el error en lugar de volver al catálogo, porque volver dejaría la sensación
	 * de que no se guardó nada cuando el nombre sí se guardó.
	 */
	const handleSave = async (payload: CategoryPayload) => {
		setError(null);

		try {
			const created = await createCategory.mutateAsync({
				name: payload.name,
				// Al crear sí se omite: una categoría nace sin descripción, no con una vacía.
				description: payload.description || undefined,
			});

			if (payload.parallelCategoryIds.length > 0) {
				await setParallel.mutateAsync({
					categoryId: created.id,
					categoryIds: payload.parallelCategoryIds,
				});
			}

			router.push(ROUTES.services);
		} catch (cause) {
			setError(messageOf(cause, 'No se pudo crear la categoría.'));
		}
	};

	return (
		<CategoryEditor
			categories={categories}
			saving={createCategory.isPending || setParallel.isPending}
			error={error}
			onSave={(payload) => void handleSave(payload)}
		/>
	);
};

export default NewCategoryPage;
