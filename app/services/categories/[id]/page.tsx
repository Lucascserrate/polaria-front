'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import CategoryEditor from '@/modules/services/CategoryEditor';
import DeleteCategoryDialog from '@/modules/services/DeleteCategoryDialog';
import type { CategoryPayload } from '@/modules/services/useCategoryDraft';
import useGetServiceCategories from '@/services/service-categories/useGetServiceCategories';
import useGetParallelCategories from '@/services/service-categories/useGetParallelCategories';
import useUpdateServiceCategory from '@/services/service-categories/useUpdateServiceCategory';
import useSetParallelCategories from '@/services/service-categories/useSetParallelCategories';
import useDeleteServiceCategory from '@/services/service-categories/useDeleteServiceCategory';
import useGetServices from '@/services/services/useGetServices';

const messageOf = (cause: unknown, fallback: string): string =>
	axios.isAxiosError(cause) && typeof cause.response?.data?.message === 'string'
		? cause.response.data.message
		: fallback;

const CategoryPage = () => {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const id = params?.id;

	/*
	 * La categoría sale de la lista, que es la misma consulta que dibuja el
	 * catálogo y ya suele estar en caché. No hay un `GET /service-categories/:id`
	 * y no hace falta inventarlo: son pocas filas por negocio y esta pantalla
	 * necesita igual a todas las demás para ofrecer con cuáles se combina.
	 */
	const {
		data: categories = [],
		isLoading,
		isError,
	} = useGetServiceCategories();
	const category = categories.find((item) => item.id === id) ?? null;

	const { data: parallelIds, isLoading: loadingParallel } =
		useGetParallelCategories(id ?? null);
	const { data: services = [] } = useGetServices();

	const updateCategory = useUpdateServiceCategory();
	const setParallel = useSetParallelCategories();
	const deleteCategory = useDeleteServiceCategory();

	const [error, setError] = useState<string | null>(null);
	const [confirmingDelete, setConfirmingDelete] = useState(false);

	/**
	 * Guarda el nombre y con qué convive, en ese orden.
	 *
	 * Dos llamadas porque son dos tablas, pero un solo botón: para quien edita es
	 * una categoría. Si la segunda falla se muestra el error y no se vuelve al
	 * catálogo, para no dar por guardado lo que quedó a medias.
	 */
	const handleSave = async (payload: CategoryPayload) => {
		if (!id) return;
		setError(null);

		try {
			await updateCategory.mutateAsync({
				id,
				data: { name: payload.name, description: payload.description },
			});

			await setParallel.mutateAsync({
				categoryId: id,
				categoryIds: payload.parallelCategoryIds,
			});

			router.push(ROUTES.services);
		} catch (cause) {
			setError(messageOf(cause, 'No se pudieron guardar los cambios.'));
		}
	};

	const handleDelete = async () => {
		if (!id) return;
		setError(null);

		try {
			await deleteCategory.mutateAsync(id);
			router.push(ROUTES.services);
		} catch (cause) {
			setConfirmingDelete(false);
			setError(messageOf(cause, 'No se pudo eliminar la categoría.'));
		}
	};

	if (isLoading || loadingParallel) {
		return (
			<p className="py-16 text-center text-muted-foreground">
				Cargando la categoría…
			</p>
		);
	}

	if (isError || !category) {
		return (
			<div className="space-y-4 py-16 text-center">
				<p className="text-muted-foreground">
					No encontramos esta categoría en el catálogo.
				</p>
				<Button asChild variant="outline">
					<Link href={ROUTES.services}>Volver a servicios</Link>
				</Button>
			</div>
		);
	}

	return (
		<>
			<CategoryEditor
				key={category.id}
				category={category}
				categories={categories}
				parallelCategoryIds={parallelIds ?? []}
				saving={updateCategory.isPending || setParallel.isPending}
				error={error}
				onSave={(payload) => void handleSave(payload)}
				onDelete={() => setConfirmingDelete(true)}
			/>

			{confirmingDelete && (
				<DeleteCategoryDialog
					category={category}
					serviceCount={
						services.filter((service) => service.categoryId === category.id)
							.length
					}
					open
					pending={deleteCategory.isPending}
					onOpenChange={(open) => !open && setConfirmingDelete(false)}
					onConfirm={() => void handleDelete()}
				/>
			)}
		</>
	);
};

export default CategoryPage;
