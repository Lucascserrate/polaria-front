'use client';

import { cloneElement, useId, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import type { ServiceCategory } from '@/types/service-categories.types';
import useCategoryDraft, {
	CATEGORY_TEXT_MAX_LENGTH,
	type CategoryPayload,
	type CategorySection,
} from './useCategoryDraft';

const SECTIONS: Array<{ key: CategorySection; label: string }> = [
	{ key: 'details', label: 'Detalles' },
	{ key: 'scheduling', label: 'Al mismo tiempo' },
];

interface Props {
	/** Ausente al crear. */
	category?: ServiceCategory | null;
	/** Todas las categorías del negocio: de ahí salen las combinables. */
	categories: ServiceCategory[];
	/** Con cuáles convive ya. Vacío al crear. */
	parallelCategoryIds?: string[];
	saving?: boolean;
	error?: string | null;
	onSave: (payload: CategoryPayload) => void;
	/**
	 * Ausente al crear. La confirmación la monta la pantalla y no este editor:
	 * lo que hay que decir antes de borrar es cuántos servicios quedan sin
	 * categoría, y ese número lo tiene el catálogo, no el formulario.
	 */
	onDelete?: () => void;
}

/**
 * Una categoría en modo edición: una pantalla, no un diálogo.
 *
 * Nació como un diálogo de dos campos y dejó de alcanzar en cuanto una categoría
 * pasó a decidir algo más que cómo se agrupa el menú: con qué otras se puede
 * atender al mismo tiempo es una decisión de agenda, con su propia explicación,
 * y no entra al lado de un campo de nombre. Antes vivía en un segundo diálogo
 * aparte, que dejaba la misma cosa repartida en dos lugares a los que se llegaba
 * por dos caminos distintos.
 *
 * Misma forma que `ServiceEditor`, y a propósito: crear y editar son la misma
 * pantalla, el guardado es uno solo en la cabecera y manda la categoría entera,
 * aunque el servidor la escriba en dos tablas.
 */
const CategoryEditor: React.FC<Props> = ({
	category,
	categories,
	parallelCategoryIds = [],
	saving = false,
	error,
	onSave,
	onDelete,
}) => {
	const [section, setSection] = useState<CategorySection>('details');
	const { draft, set, errors, canSave, toPayload } = useCategoryDraft(
		category,
		parallelCategoryIds,
	);

	/*
	 * Todas menos ella misma. Ofrecer "Manicures al mismo tiempo que Manicures" y
	 * que el servidor lo rechace al guardar es peor que no ofrecerlo: dos
	 * manicures a la vez sobre la misma clienta no existen.
	 */
	const others = categories.filter((other) => other.id !== category?.id);

	const toggle = (id: string) =>
		set(
			'parallelCategoryIds',
			draft.parallelCategoryIds.includes(id)
				? draft.parallelCategoryIds.filter((other) => other !== id)
				: [...draft.parallelCategoryIds, id],
		);

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div className="flex min-w-0 items-center gap-3">
					<Button
						asChild
						variant="ghost"
						size="icon-sm"
						aria-label="Volver a servicios"
					>
						<Link href={ROUTES.services}>
							<ArrowLeft className="size-4" />
						</Link>
					</Button>
					<h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
						{category ? category.name : 'Nueva categoría'}
					</h1>
				</div>

				<div className="flex items-center gap-2">
					{/*
					 * Eliminar vive acá **y** en el menú de la lista, por lo mismo que
					 * desactivar en el editor de servicios: una vez abierta la ficha, no
					 * ofrecerlo sería mandar a cerrar la pantalla para hacer algo que es
					 * de esta categoría.
					 */}
					{onDelete && (
						<Button
							variant="ghost"
							className="text-destructive hover:bg-destructive/10 hover:text-destructive"
							onClick={onDelete}
						>
							Eliminar
						</Button>
					)}
					<Button asChild variant="outline">
						<Link href={ROUTES.services}>Cancelar</Link>
					</Button>
					<Button
						disabled={!canSave || saving}
						onClick={() => onSave(toPayload())}
					>
						{saving && <Spinner className="size-3.5" />}
						{category ? 'Guardar cambios' : 'Crear categoría'}
					</Button>
				</div>
			</div>

			{error && (
				<p className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-destructive">
					{error}
				</p>
			)}

			<div className="flex flex-col gap-6 lg:flex-row">
				{/*
				 * En móvil el nav es una fila con scroll horizontal, no un bloque antes
				 * del formulario: ahí el alto es lo escaso. Mismo criterio que los otros
				 * editores.
				 */}
				<nav className="shrink-0 lg:w-60">
					<div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:space-y-1 lg:overflow-visible lg:rounded-xl lg:border lg:border-border lg:p-3">
						<p className="hidden px-3 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase lg:block">
							Datos de la categoría
						</p>

						{SECTIONS.map((item) => {
							const active = section === item.key;
							const hasError = Boolean(errors[item.key]);

							return (
								<button
									key={item.key}
									type="button"
									aria-current={active ? 'page' : undefined}
									onClick={() => setSection(item.key)}
									className={cn(
										'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors lg:w-full',
										active
											? 'bg-muted font-medium text-foreground'
											: 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
									)}
								>
									<span className="flex-1 text-left">{item.label}</span>
									{hasError && (
										<AlertCircle
											className="size-3.5 text-destructive"
											aria-label="Falta resolver algo en esta sección"
										/>
									)}
								</button>
							);
						})}
					</div>
				</nav>

				<div className="min-w-0 flex-1 rounded-xl border border-border p-4 sm:p-6">
					{section === 'details' ? (
						<div className="space-y-4">
							<div>
								<h2 className="text-lg font-semibold">Detalles</h2>
								<p className="text-sm text-muted-foreground">
									Con qué nombre agrupa tus servicios, acá y en el menú que ve
									tu cliente.
								</p>
							</div>

							<Field
								label="Nombre"
								required
								count={draft.name.length}
								max={CATEGORY_TEXT_MAX_LENGTH}
							>
								<Input
									value={draft.name}
									placeholder="Manicures"
									maxLength={CATEGORY_TEXT_MAX_LENGTH}
									onChange={(event) => set('name', event.target.value)}
								/>
							</Field>

							<Field
								label="Descripción"
								hint="Opcional. Aclara qué servicios hay adentro."
								count={draft.description.length}
								max={CATEGORY_TEXT_MAX_LENGTH}
							>
								<Input
									value={draft.description}
									placeholder="Clásica, gel y francesa"
									maxLength={CATEGORY_TEXT_MAX_LENGTH}
									onChange={(event) => set('description', event.target.value)}
								/>
							</Field>

							{errors.details && <SectionError message={errors.details} />}
						</div>
					) : (
						<div className="space-y-4">
							<div>
								<h2 className="text-lg font-semibold">Al mismo tiempo</h2>
								<p className="text-sm text-muted-foreground">
									Con qué categorías se puede atender ésta en simultáneo, con
									dos profesionales. Una clienta que pide una manicure y una
									pedicure reserva una hora en lugar de dos.
								</p>
							</div>

							{others.length === 0 ? (
								<p className="rounded-lg bg-muted/60 px-3 py-6 text-center text-sm text-muted-foreground">
									Necesitás al menos otra categoría para poder combinarlas.
								</p>
							) : (
								<>
									<ul className="space-y-1">
										{others.map((other) => (
											<li key={other.id}>
												<label className="flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 hover:bg-muted/60">
													<Checkbox
														className="mt-0.5"
														checked={draft.parallelCategoryIds.includes(
															other.id,
														)}
														onCheckedChange={() => toggle(other.id)}
													/>
													<span className="min-w-0">
														<span className="block text-sm font-medium">
															{other.name}
														</span>
														{other.description && (
															<span className="block truncate text-xs text-muted-foreground">
																{other.description}
															</span>
														)}
													</span>
												</label>
											</li>
										))}
									</ul>

									<p className="text-xs text-muted-foreground">
										Sólo se aplica cuando hay dos profesionales libres que
										puedan hacerlos. Si queda uno solo, la reserva se agenda uno
										después del otro. Marcarlo acá también lo marca en la otra
										categoría.
									</p>
								</>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

const SectionError: React.FC<{ message: string }> = ({ message }) => (
	<p className="flex items-center gap-1.5 text-sm text-destructive">
		<AlertCircle className="size-4 shrink-0" />
		{message}
	</p>
);

/**
 * Una etiqueta y su campo, asociados de verdad.
 *
 * El `id` se genera y se inyecta en el hijo en lugar de dejar la etiqueta suelta
 * al lado: sin `htmlFor`, un lector de pantalla anuncia el campo sin nombre, y
 * tocar la etiqueta no enfoca el input.
 */
const Field: React.FC<{
	label: string;
	required?: boolean;
	hint?: string;
	count?: number;
	max?: number;
	children: React.ReactElement<{ id?: string }>;
}> = ({ label, required, hint, count, max, children }) => {
	const id = useId();
	const showsCount = count !== undefined && max !== undefined;

	return (
		<div>
			<Label htmlFor={id} className="mb-1.5 block">
				{label}
				{required && <span className="ml-0.5 text-destructive">*</span>}
			</Label>
			{cloneElement(children, { id })}

			{(hint || showsCount) && (
				<div className="mt-1 flex items-start justify-between gap-3">
					<p className="text-xs text-muted-foreground">{hint}</p>

					{showsCount && (
						<span
							className={cn(
								'shrink-0 font-mono text-xs tabular-nums',
								count >= max ? 'text-warning' : 'text-muted-foreground',
							)}
						>
							{`${count} / ${max}`}
						</span>
					)}
				</div>
			)}
		</div>
	);
};

export default CategoryEditor;
