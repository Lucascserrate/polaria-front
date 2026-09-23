'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES, categoryRoute } from '@/constants/routes';
import { TOUR } from '@/modules/onboarding/tour/anchors';
import CategoryFilter, {
	ALL_CATEGORIES,
} from '@/modules/services/CategoryFilter';
import DeactivateServiceDialog from '@/modules/services/DeactivateServiceDialog';
import DeleteCategoryDialog from '@/modules/services/DeleteCategoryDialog';
import InactiveServicesBar from '@/modules/services/InactiveServicesBar';
import ReorderCategoriesDialog from '@/modules/services/ReorderCategoriesDialog';
import ServicesTable from '@/modules/services/ServicesTable';
import useServiceDrag from '@/modules/services/useServiceDrag';
import {
	groupByCategory,
	UNCATEGORIZED_ID,
	UNCATEGORIZED_LABEL,
} from '@/modules/services/utils/groupByCategory';
import useGetServices from '@/services/services/useGetServices';
import useGetServiceCategories from '@/services/service-categories/useGetServiceCategories';
import useDeleteServiceCategory from '@/services/service-categories/useDeleteServiceCategory';
import useAssignServiceCategory from '@/services/services/useAssignServiceCategory';
import useSetServiceActive from '@/services/services/useSetServiceActive';
import type { ServiceCategory } from '@/types/service-categories.types';
import type { Service } from '@/types/services.types';

/**
 * El catálogo de servicios, agrupado por categoría.
 *
 * Las categorías nacen de un salón con demasiados servicios: una lista plana de
 * treinta filas no se recorre, ni acá ni —sobre todo— en la lista de WhatsApp que
 * ve el cliente. Acá se arman y se asignan; el menú por categorías del canal es
 * el paso siguiente.
 */
const ServicesPage = () => {
	const {
		data: catalog = [],
		isPending,
		isError,
		error,
	} = useGetServices('all');
	const { data: categories = [] } = useGetServiceCategories();
	const deleteCategory = useDeleteServiceCategory();
	const assignCategory = useAssignServiceCategory();
	const setServiceActive = useSetServiceActive();

	const router = useRouter();
	const [filter, setFilter] = useState<string>(ALL_CATEGORIES);
	const [deleting, setDeleting] = useState<ServiceCategory | null>(null);
	const [reordering, setReordering] = useState(false);
	const [showInactive, setShowInactive] = useState(false);
	const [deactivating, setDeactivating] = useState<Service | null>(null);

	const inactiveCount = catalog.filter(
		(service) => service.isActive === false,
	).length;

	/**
	 * Lo que se lista. Sin los dados de baja, salvo que se hayan pedido.
	 *
	 * Los contadores —el del título y los de la columna— cuentan sobre esto y no
	 * sobre el catálogo entero: si dijeran otra cosa que la lista que están al
	 * lado de, el filtro parecería roto. Que el número suba al tocar "Ver todo" es
	 * correcto; lo pidió quien lo tocó, y el renglón del final dice cuántos de esos
	 * están desactivados.
	 */
	const services = showInactive
		? catalog
		: catalog.filter((service) => service.isActive !== false);

	/*
	 * Soltar un servicio sobre una categoría de la columna lo mueve ahí. Soltarlo
	 * sobre "Sin categoría" lo saca de la suya, que es el `null`.
	 */
	const drag = useServiceDrag((serviceId, target) => {
		const categoryId = target === UNCATEGORIZED_ID ? null : target;

		// Soltar un servicio donde ya estaba no es un cambio: pedirle al servidor
		// que lo deje igual haría parpadear la lista por nada.
		const current = catalog.find((service) => service.id === serviceId);
		if ((current?.categoryId ?? null) === categoryId) return;

		assignCategory.mutate({ id: serviceId, categoryId });
	});

	/** El nombre del grupo donde caería ahora, para decirlo mientras se arrastra. */
	const dropName =
		drag.over === UNCATEGORIZED_ID
			? UNCATEGORIZED_LABEL
			: (categories.find((category) => category.id === drag.over)?.name ??
				null);

	const groups = useMemo(
		() => groupByCategory(services, categories),
		[services, categories],
	);

	/*
	 * El filtro esconde grupos, no los recalcula: así los contadores de la barra
	 * lateral siguen contando sobre el catálogo entero mientras se mira una sola
	 * categoría, que es lo que hace que se pueda saltar de una a otra sin volver
	 * a "Todas".
	 */
	const visibleGroups = groups.filter((group) => {
		if (filter === ALL_CATEGORIES) return true;
		if (filter === UNCATEGORIZED_ID) return group.category === null;
		return group.category?.id === filter;
	});

	const handleToggleActive = (service: Service) => {
		if (service.isActive === false) {
			setServiceActive.mutate({ id: service.id, isActive: true });
			return;
		}

		setDeactivating(service);
	};

	const confirmDeactivate = async () => {
		if (!deactivating) return;

		await setServiceActive.mutateAsync({
			id: deactivating.id,
			isActive: false,
		});
		setDeactivating(null);
	};

	const handleDelete = async () => {
		if (!deleting) return;

		await deleteCategory.mutateAsync(deleting.id);
		if (filter === deleting.id) setFilter(ALL_CATEGORIES);
		setDeleting(null);
	};

	if (isPending) {
		return (
			<p className="py-16 text-center text-muted-foreground">
				Cargando los servicios…
			</p>
		);
	}

	if (isError) {
		return (
			<p className="py-16 text-center text-destructive">
				{error?.message ?? 'No se pudieron cargar los servicios.'}
			</p>
		);
	}

	return (
		<div className="space-y-6 select-none">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl">
						Servicios
						<span className="rounded-full bg-muted px-2.5 py-0.5 text-sm font-medium tabular-nums text-muted-foreground">
							{services.length}
						</span>
					</h1>
					<p className="mt-1 text-muted-foreground">
						Qué ofrece el negocio, cuánto dura y cuánto cuesta.
					</p>
				</div>

				<Button asChild className="gap-2" data-tour={TOUR.servicesNew}>
					<Link href={ROUTES.servicesNew}>
						<Plus className="size-4" />
						Nuevo
					</Link>
				</Button>
			</div>

			<div className="flex flex-col gap-6 lg:flex-row">
				{/*
				 * La columna está desde el principio, con "Todas" y "Sin categoría"
				 * aunque todavía no haya ninguna creada: así el botón de añadir vive
				 * siempre en el mismo lugar en vez de mudarse cuando aparece la
				 * primera.
				 */}
				<CategoryFilter
					groups={groups}
					total={services.length}
					value={filter}
					onChange={setFilter}
					onAdd={() => router.push(ROUTES.categoryNew)}
					dropTarget={drag.over}
					// Con una sola categoría no hay orden que elegir.
					onReorder={
						categories.length > 1 ? () => setReordering(true) : undefined
					}
				/>

				<div className="min-w-0 flex-1">
					<ServicesTable
						groups={visibleGroups}
						onEditCategory={(category) =>
							router.push(categoryRoute(category.id))
						}
						onDeleteCategory={setDeleting}
						onToggleActive={handleToggleActive}
						togglingId={
							setServiceActive.isPending
								? (setServiceActive.variables?.id ?? null)
								: null
						}
						// Sin categorías creadas no hay a dónde arrastrar.
						onDragStart={categories.length > 0 ? drag.start : undefined}
						draggingId={drag.dragging?.id ?? null}
						dropTarget={drag.over}
					/>
					<div className="mt-4">
						<InactiveServicesBar
							count={inactiveCount}
							showing={showInactive}
							onToggle={() => setShowInactive((current) => !current)}
						/>
					</div>
				</div>
			</div>

			{/*
			 * El servicio que viaja con el cursor. Sin esto el arrastre no se ve en
			 * táctil, donde el dedo tapa justo la fila que se está moviendo.
			 *
			 * `pointer-events-none` no es cosmético: sin eso, el fantasma queda
			 * debajo del cursor y `elementFromPoint` lo devuelve a él en lugar de la
			 * categoría de abajo, así que nunca habría destino.
			 */}
			{drag.dragging && drag.point && (
				<div
					className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-primary bg-background px-3 py-1.5 text-sm shadow-lg"
					style={{ left: drag.point.x, top: drag.point.y }}
				>
					<span className="font-medium">{drag.dragging.name}</span>
					{/* Decir el destino acá y no sólo recuadrarlo: el cursor es donde
					    están puestos los ojos, y el grupo resaltado puede quedar medio
					    fuera de la pantalla. */}
					{dropName && (
						<span className="text-muted-foreground"> → {dropName}</span>
					)}
				</div>
			)}

			<ReorderCategoriesDialog
				categories={categories}
				open={reordering}
				onOpenChange={setReordering}
			/>

			{deactivating && (
				<DeactivateServiceDialog
					service={deactivating}
					open
					pending={setServiceActive.isPending}
					onOpenChange={(open) => {
						if (!open) setDeactivating(null);
					}}
					onConfirm={() => void confirmDeactivate()}
				/>
			)}

			{deleting && (
				<DeleteCategoryDialog
					category={deleting}
					serviceCount={
						services.filter((service) => service.categoryId === deleting.id)
							.length
					}
					open
					pending={deleteCategory.isPending}
					onOpenChange={(open) => !open && setDeleting(null)}
					onConfirm={() => void handleDelete()}
				/>
			)}
		</div>
	);
};

export default ServicesPage;
