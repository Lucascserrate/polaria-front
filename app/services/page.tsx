'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { TOUR } from '@/modules/onboarding/tour/anchors';
import CategoryDialog from '@/modules/services/CategoryDialog';
import CategoryFilter, {
	ALL_CATEGORIES,
} from '@/modules/services/CategoryFilter';
import DeleteCategoryDialog from '@/modules/services/DeleteCategoryDialog';
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
import type { ServiceCategory } from '@/types/service-categories.types';

/**
 * El catálogo de servicios, agrupado por categoría.
 *
 * Las categorías nacen de un salón con demasiados servicios: una lista plana de
 * treinta filas no se recorre, ni acá ni —sobre todo— en la lista de WhatsApp que
 * ve el cliente. Acá se arman y se asignan; el menú por categorías del canal es
 * el paso siguiente.
 *
 * El negocio que no las necesita no paga nada por ellas: sin ninguna creada, la
 * lista es la de siempre, sin encabezados de grupo.
 *
 * Ya no hay tarjetas de resumen arriba. Eran tres —total, duración promedio,
 * precio promedio— y ninguna se usaba para decidir nada: el total ya lo dice la
 * lista, y los promedios de un catálogo de cinco servicios no describen al negocio
 * ni a ninguno de ellos. Ocupaban la primera pantalla completa antes de mostrar lo
 * que se venía a ver.
 */
const ServicesPage = () => {
	const { data: services = [], isPending, isError, error } = useGetServices();
	const { data: categories = [] } = useGetServiceCategories();
	const deleteCategory = useDeleteServiceCategory();
	const assignCategory = useAssignServiceCategory();

	const [filter, setFilter] = useState<string>(ALL_CATEGORIES);
	const [editing, setEditing] = useState<ServiceCategory | null>(null);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [deleting, setDeleting] = useState<ServiceCategory | null>(null);
	const [reordering, setReordering] = useState(false);

	/*
	 * Soltar un servicio sobre una categoría de la columna lo mueve ahí. Soltarlo
	 * sobre "Sin categoría" lo saca de la suya, que es el `null`.
	 */
	const drag = useServiceDrag((serviceId, target) => {
		const categoryId = target === UNCATEGORIZED_ID ? null : target;

		// Soltar un servicio donde ya estaba no es un cambio: pedirle al servidor
		// que lo deje igual haría parpadear la lista por nada.
		const current = services.find((service) => service.id === serviceId);
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

	const openNewCategory = () => {
		setEditing(null);
		setDialogOpen(true);
	};

	const handleDelete = async () => {
		if (!deleting) return;

		await deleteCategory.mutateAsync(deleting.id);
		// El filtro apuntaba a la categoría que ya no existe: sin esto, la lista
		// queda vacía sin decir por qué.
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
		/*
		 * `select-none` en la pantalla entera, no sólo mientras se arrastra.
		 *
		 * Quien va a arrastrar aprieta sobre una fila antes de encontrar el asa, y
		 * ahí el navegador ya empezó a pintar de azul el nombre y el precio. Para
		 * cuando el arrastre arranca y se podría apagar la selección, el estropicio
		 * está hecho. El precio es no poder copiar un nombre desde la lista, que en
		 * una pantalla de administración no es algo que se haga.
		 */
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
					onAdd={openNewCategory}
					dropTarget={drag.over}
					// Con una sola categoría no hay orden que elegir.
					onReorder={
						categories.length > 1 ? () => setReordering(true) : undefined
					}
				/>

				<div className="min-w-0 flex-1">
					<ServicesTable
						groups={visibleGroups}
						onEditCategory={(category) => {
							setEditing(category);
							setDialogOpen(true);
						}}
						onDeleteCategory={setDeleting}
						// Sin categorías creadas no hay a dónde arrastrar.
						onDragStart={categories.length > 0 ? drag.start : undefined}
						draggingId={drag.dragging?.id ?? null}
						dropTarget={drag.over}
					/>
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

			<CategoryDialog
				open={dialogOpen}
				category={editing}
				onOpenChange={setDialogOpen}
			/>

			<ReorderCategoriesDialog
				categories={categories}
				open={reordering}
				onOpenChange={setReordering}
			/>

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
