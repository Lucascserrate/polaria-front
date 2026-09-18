'use client';

import Link from 'next/link';
import { ChevronDown, Plus, Stethoscope } from 'lucide-react';
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
import { UNCATEGORIZED_LABEL } from './utils/groupByCategory';

interface Props {
	groups: ServiceGroup[];
	onEditCategory: (category: ServiceCategory) => void;
	onDeleteCategory: (category: ServiceCategory) => void;
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
}> = ({ group, headed, onEdit, onDelete }) => {
	const { category, services } = group;

	return (
		<section className="space-y-2">
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
				<p className="rounded-xl border border-dashed border-border px-4 py-4 text-sm text-muted-foreground">
					Sin servicios. Se los asigna desde la ficha de cada uno, en Categoría.
				</p>
			) : (
				<ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
					{services.map((service) => (
						<li key={service.id}>
							<ServiceRow service={service} />
						</li>
					))}
				</ul>
			)}
		</section>
	);
};

const ServiceRow: React.FC<{ service: Service }> = ({ service }) => (
	<Link
		href={`${ROUTES.services}/${service.id}`}
		className="flex items-center justify-between gap-4 px-3 py-2.5 transition-colors hover:bg-muted/50 sm:px-4"
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
