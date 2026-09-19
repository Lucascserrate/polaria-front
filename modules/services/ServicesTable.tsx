'use client';

import Link from 'next/link';
import { ChevronDown, GripVertical, Plus, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/constants/routes';
import { formatDuration } from '@/lib/duration';
import { formatServiceMoney } from '@/lib/money';
import { cn } from '@/lib/utils';
import type { Service } from '@/types/services.types';
import type { ServiceCategory } from '@/types/service-categories.types';
import type { ServiceGroup } from './utils/groupByCategory';
import { UNCATEGORIZED_ID, UNCATEGORIZED_LABEL } from './utils/groupByCategory';
import { DROP_ATTRIBUTE } from './useServiceDrag';

interface Props {
	groups: ServiceGroup[];
	onEditCategory: (category: ServiceCategory) => void;
	onDeleteCategory: (category: ServiceCategory) => void;
	/** Ausente sin categorías: no habría a dónde arrastrar. */
	onDragStart?: (event: React.PointerEvent, service: Service) => void;
	/** El que se está arrastrando ahora, para atenuarlo. */
	draggingId?: string | null;
	/** El grupo sobre el que caería ahora mismo lo que se arrastra. */
	dropTarget?: string | null;
}

/**
 * El catálogo, agrupado por categoría.
 *
 * Los servicios de un grupo van dentro de un mismo marco, separados por una
 * línea, y no como tarjetas sueltas: un catálogo es una lista de precios y se
 * lee de un vistazo, recorriendo la columna de la derecha. Con una tarjeta por
 * servicio, cada fila traía su borde y su espacio alrededor, y diez servicios
 * ocupaban dos pantallas de las cuales la mitad era aire.
 *
 * Una misma fila en todos los anchos, y no una tabla en escritorio y una lista en
 * móvil como antes. Con grupos, la tabla obligaba a repetir el encabezado de
 * columnas en cada categoría —o a dejar tablas distintas con anchos que no
 * coinciden entre sí—, y esas tres columnas ("Servicio", "Duración", "Precio") no
 * hacían falta para leer "Corte de pelo · 1 h 30 min · 25 BOB".
 *
 * Los grupos vacíos se muestran igual, con su aviso. La categoría recién creada
 * es justo la que hay que poder ver para empezar a llenarla, y es también donde
 * están sus acciones para renombrarla o borrarla si fue un error.
 *
 * Sin acciones por servicio: la fila entera lleva al editor y eliminar vive
 * adentro. Sacar un servicio del catálogo no debería estar a un click de paso
 * mientras alguien recorre la lista.
 */
const ServicesTable: React.FC<Props> = ({
	groups,
	onEditCategory,
	onDeleteCategory,
	onDragStart,
	draggingId,
	dropTarget,
}) => {
	if (groups.length === 0) {
		return (
			<div className="rounded-xl border border-border py-12 text-center">
				<p className="mb-4 text-muted-foreground">
					Todavía no hay servicios en el catálogo.
				</p>
				<Button asChild>
					<Link href={ROUTES.servicesNew}>
						<Plus className="size-4" />
						Nuevo servicio
					</Link>
				</Button>
			</div>
		);
	}

	/*
	 * El negocio que nunca creó una categoría ve la lista de siempre, sin
	 * encabezados: un único "Sin categoría" arriba de todo no agrupa nada y
	 * nombra un problema que ese negocio no tiene.
	 */
	const headed = groups.length > 1 || groups[0].category !== null;

	return (
		<div className="space-y-6">
			{groups.map((group) => (
				<CategoryGroup
					key={group.category?.id ?? 'none'}
					group={group}
					headed={headed}
					onEdit={onEditCategory}
					onDelete={onDeleteCategory}
					onDragStart={onDragStart}
					draggingId={draggingId}
					dropTarget={dropTarget}
				/>
			))}
		</div>
	);
};

/**
 * Una categoría y sus servicios.
 *
 * El cajón de los que no tienen categoría no lleva acciones: no es una categoría
 * que se pueda renombrar o borrar, es dónde caen los que no están en ninguna.
 */
const CategoryGroup: React.FC<{
	group: ServiceGroup;
	/** Si la pantalla está agrupando. Ver `ServicesTable`. */
	headed: boolean;
	onEdit: (category: ServiceCategory) => void;
	onDelete: (category: ServiceCategory) => void;
	onDragStart?: (event: React.PointerEvent, service: Service) => void;
	draggingId?: string | null;
	dropTarget?: string | null;
}> = ({
	group,
	headed,
	onEdit,
	onDelete,
	onDragStart,
	draggingId,
	dropTarget,
}) => {
	const { category, services } = group;
	const target = category?.id ?? UNCATEGORIZED_ID;
	const over = dropTarget === target;

	return (
		/*
		 * El grupo entero es destino de arrastre, no sólo la categoría de la
		 * columna. Es donde la mano va sola: la lista ya está dividida por
		 * categoría, así que mover un servicio es llevarlo al bloque de al lado.
		 * Con destino únicamente en la columna, el gesto natural no hacía nada y
		 * parecía que el arrastre estaba roto.
		 *
		 * El recuadro es la respuesta a "¿dónde va a caer esto?", que sin nada
		 * dibujado hay que adivinar. Va en la sección entera —encabezado incluido—
		 * porque es la unidad que se elige.
		 */
		<section
			{...(onDragStart && { [DROP_ATTRIBUTE]: target })}
			className={cn(
				'scroll-mt-4 space-y-2 rounded-xl transition-colors',
				over && 'bg-primary/5',
			)}
		>
			{headed && (
				<div className="flex items-center justify-between gap-3">
					<div className="min-w-0">
						<h2 className="truncate font-semibold">
							{category?.name ?? UNCATEGORIZED_LABEL}
						</h2>
						{category?.description && (
							<p className="truncate text-xs text-muted-foreground">
								{category.description}
							</p>
						)}
					</div>

					{category && (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="ghost"
									size="sm"
									className="shrink-0 gap-1 text-muted-foreground"
									aria-label={`Acciones de ${category.name}`}
								>
									Acciones
									<ChevronDown className="size-3.5" />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem onSelect={() => onEdit(category)}>
									Editar categoría
								</DropdownMenuItem>
								<DropdownMenuItem
									variant="destructive"
									onSelect={() => onDelete(category)}
								>
									Eliminar categoría
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			)}

			{services.length === 0 ? (
				<p
					className={cn(
						'rounded-xl border border-dashed px-4 py-4 text-sm transition-colors',
						over
							? 'border-primary text-foreground'
							: 'border-border text-muted-foreground',
					)}
				>
					{over
						? 'Soltá acá para mover el servicio a esta categoría.'
						: 'Sin servicios. Arrastrá uno hasta acá, o asignalo desde su ficha.'}
				</p>
			) : (
				<ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
					{services.map((service) => (
						<li key={service.id} className="flex items-center">
							{onDragStart && (
								<DragHandle service={service} onDragStart={onDragStart} />
							)}
							<ServiceRow
								service={service}
								dragging={draggingId === service.id}
							/>
						</li>
					))}
				</ul>
			)}
		</section>
	);
};

/**
 * El asa de arrastre, a la izquierda de la fila y **fuera** del enlace.
 *
 * Fuera porque la fila entera lleva al editor: si el arrastre empezara en
 * cualquier punto, cada intento de abrir un servicio sería un arrastre fallido.
 * Con asa, cada gesto dice qué quiere.
 *
 * Solo en pantallas anchas, que son las que tienen a la vista la columna de
 * categorías. Sin destino visible no hay a dónde soltar, y en el teléfono la
 * categoría se elige desde la ficha del servicio.
 */
const DragHandle: React.FC<{
	service: Service;
	onDragStart: (event: React.PointerEvent, service: Service) => void;
}> = ({ service, onDragStart }) => (
	<button
		type="button"
		aria-label={`Arrastrar ${service.name} a otra categoría`}
		// `touch-none` es lo que evita que el dedo desplace la página en lugar de
		// arrastrar la fila.
		className="hidden shrink-0 cursor-grab touch-none px-2 py-3 text-muted-foreground/50 transition-colors hover:text-foreground active:cursor-grabbing lg:block"
		onPointerDown={(event) => onDragStart(event, service)}
	>
		<GripVertical className="size-4" />
	</button>
);

const ServiceRow: React.FC<{ service: Service; dragging?: boolean }> = ({
	service,
	dragging,
}) => (
	<Link
		href={`${ROUTES.services}/${service.id}`}
		className={cn(
			'flex flex-1 items-center justify-between gap-4 px-3 py-2.5 transition-colors hover:bg-muted/50 sm:px-4',
			dragging && 'opacity-40',
		)}
	>
		<span className="min-w-0">
			<span className="block truncate text-sm font-medium">{service.name}</span>

			{/*
			 * Duración y aclaración en la misma línea, separadas por un punto. Eran
			 * dos renglones debajo del nombre y hacían una fila de tres pisos para
			 * decir algo que entra en uno.
			 */}
			<span className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
				<span className="shrink-0 tabular-nums">
					{formatDuration(service.durationMinutes)}
				</span>
				{service.bookingPolicy === 'CONSULTATION_FIRST' ? (
					<>
						<Dot />
						<Stethoscope className="size-3 shrink-0" />
						<span className="truncate">Requiere consulta previa</span>
					</>
				) : (
					service.description && (
						<>
							<Dot />
							<span className="truncate">{service.description}</span>
						</>
					)
				)}
			</span>
		</span>

		{/*
		 * `tabular-nums` sólo cuando hay número: los importes se alinean entre sí,
		 * y el aviso de los que se cotizan es texto.
		 */}
		<span
			className={cn(
				'shrink-0 text-sm font-medium',
				service.price !== null && 'tabular-nums',
			)}
		>
			{formatServiceMoney(service.price, service.currency)}
		</span>
	</Link>
);

const Dot: React.FC = () => (
	<span aria-hidden className="shrink-0">
		·
	</span>
);

export default ServicesTable;
