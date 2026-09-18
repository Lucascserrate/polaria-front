'use client';

import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ServiceGroup } from './utils/groupByCategory';
import { UNCATEGORIZED_LABEL } from './utils/groupByCategory';

/** Lo que significa "no hay ninguna categoría seleccionada". */
export const ALL_CATEGORIES = 'all';

/** El valor con el que se filtra el cajón de los que no tienen categoría. */
export const UNCATEGORIZED = 'none';

export type CategoryFilterValue = string;

interface Props {
	groups: ServiceGroup[];
	total: number;
	value: CategoryFilterValue;
	onChange: (value: CategoryFilterValue) => void;
	onAdd: () => void;
}

/**
 * Elegir qué parte del catálogo se está mirando, y crear categorías nuevas.
 *
 * Es una columna en escritorio y una fila de chips en móvil, y no el mismo
 * control encogido: una lista vertical de ocho categorías en un teléfono se come
 * la pantalla antes de mostrar un solo servicio, que es lo que se vino a ver.
 *
 * Se muestra siempre, incluso antes de que exista la primera categoría. La
 * columna con "Todas" y "Sin categoría" ya dice de qué va la pantalla, y el botón
 * de crear queda en el mismo lugar desde el principio en vez de mudarse cuando
 * aparece la primera.
 *
 * Lleva el número al lado de cada nombre porque es la respuesta a la pregunta por
 * la que se abre esta pantalla cuando el catálogo creció: dónde está lo que falta
 * ordenar. Una categoría en cero se ve de lejos.
 *
 * Renombrar y eliminar no están acá: viven en el encabezado de cada grupo, al
 * lado de los servicios que la decisión afecta.
 */
const CategoryFilter: React.FC<Props> = ({
	groups,
	total,
	value,
	onChange,
	onAdd,
}) => {
	const options = [
		{ key: ALL_CATEGORIES, label: 'Todas las categorías', count: total },
		...groups.map((group) => ({
			key: group.category?.id ?? UNCATEGORIZED,
			label: group.category?.name ?? UNCATEGORIZED_LABEL,
			count: group.services.length,
		})),
	];

	return (
		<>
			{/* Escritorio */}
			<nav className="hidden shrink-0 rounded-xl border border-border p-2 lg:block lg:w-60">
				<p className="px-2 pt-1.5 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
					Categorías
				</p>

				<ul>
					{options.map((option) => (
						<li key={option.key}>
							<button
								type="button"
								aria-current={value === option.key ? 'true' : undefined}
								onClick={() => onChange(option.key)}
								className={cn(
									'flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition-colors',
									value === option.key
										? 'bg-muted font-medium text-foreground'
										: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
								)}
							>
								<span className="min-w-0 flex-1 truncate">{option.label}</span>
								<Count value={option.count} />
							</button>
						</li>
					))}
				</ul>

				<button
					type="button"
					onClick={onAdd}
					className="mt-0.5 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-primary transition-colors hover:bg-muted/50"
				>
					<Plus className="size-4 shrink-0" />
					Añadir categoría
				</button>
			</nav>

			{/*
			 * Móvil: una fila que se arrastra con el dedo. No hay nada que dependa de
			 * la rueda del mouse, que en escritorio es la columna de arriba.
			 */}
			<div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden">
				{options.map((option) => (
					<button
						key={option.key}
						type="button"
						aria-current={value === option.key ? 'true' : undefined}
						onClick={() => onChange(option.key)}
						className={cn(
							'flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors',
							value === option.key
								? 'border-primary bg-primary/10 font-medium text-foreground'
								: 'border-border text-muted-foreground',
						)}
					>
						{option.label}
						<Count value={option.count} />
					</button>
				))}

				<button
					type="button"
					onClick={onAdd}
					className="flex shrink-0 items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-sm whitespace-nowrap text-primary"
				>
					<Plus className="size-4" />
					Categoría
				</button>
			</div>
		</>
	);
};

const Count: React.FC<{ value: number }> = ({ value }) => (
	<span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground">
		{value}
	</span>
);

export default CategoryFilter;
