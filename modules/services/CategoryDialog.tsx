'use client';

import { useId, useState } from 'react';
import axios from 'axios';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';
import type { ServiceCategory } from '@/types/service-categories.types';
import useCreateServiceCategory from '@/services/service-categories/useCreateServiceCategory';
import useUpdateServiceCategory from '@/services/service-categories/useUpdateServiceCategory';

/** Lo que aguanta la columna, igual que en el servicio. */
const TEXT_MAX_LENGTH = 255;

interface Props {
	open: boolean;
	/** Ausente al crear; presente la abre para renombrar. */
	category?: ServiceCategory | null;
	onOpenChange: (open: boolean) => void;
	/** La categoría recién creada, para poder dejarla seleccionada. */
	onCreated?: (category: ServiceCategory) => void;
}

/**
 * Crear o renombrar una categoría.
 *
 * Un diálogo y no una pantalla, al revés que el editor de servicios: son dos
 * campos y se abre desde la lista sin salir de ella, que es donde se está
 * mirando qué falta agrupar. Un servicio tiene precio, duración y política, y eso
 * ya no entra en un diálogo; una categoría es un nombre.
 *
 * El mismo diálogo crea y renombra porque el formulario es idéntico. Lo único que
 * cambia es a qué mutación va, y duplicar el componente para eso dejaría dos
 * lugares donde arreglar el mismo error de validación.
 */
const CategoryDialog: React.FC<Props> = ({
	open,
	category,
	onOpenChange,
	onCreated,
}) => (
	<Dialog open={open} onOpenChange={onOpenChange}>
		<DialogContent className="sm:max-w-md">
			<DialogHeader>
				<DialogTitle>
					{category ? 'Editar categoría' : 'Añadir categoría'}
				</DialogTitle>
				<DialogDescription>
					Sirve para agrupar el catálogo cuando son muchos servicios.
				</DialogDescription>
			</DialogHeader>

			{/*
			 * El formulario es un componente aparte con `key`, y no un estado en el
			 * diálogo que se limpie al abrirlo: el contenido se desmonta al cerrar, así
			 * que arranca vacío solo, y la `key` cubre el único caso que eso no cubre
			 * —pasar de una categoría a otra sin cerrar—. Rellenarlo desde un efecto
			 * era la otra opción y encadena un render de más en cada apertura.
			 */}
			<CategoryForm
				key={category?.id ?? 'new'}
				category={category}
				onDone={() => onOpenChange(false)}
				onCancel={() => onOpenChange(false)}
				onCreated={onCreated}
			/>
		</DialogContent>
	</Dialog>
);

const CategoryForm: React.FC<{
	category?: ServiceCategory | null;
	onDone: () => void;
	onCancel: () => void;
	onCreated?: (category: ServiceCategory) => void;
}> = ({ category, onDone, onCancel, onCreated }) => {
	const nameId = useId();
	const descriptionId = useId();
	const createCategory = useCreateServiceCategory();
	const updateCategory = useUpdateServiceCategory();

	const [name, setName] = useState(category?.name ?? '');
	const [description, setDescription] = useState(category?.description ?? '');
	const [error, setError] = useState<string | null>(null);

	const saving = createCategory.isPending || updateCategory.isPending;
	const trimmed = name.trim();

	const handleSubmit = async () => {
		if (!trimmed || saving) return;
		setError(null);

		const data = {
			name: trimmed,
			description: description.trim() || undefined,
		};

		try {
			if (category) {
				await updateCategory.mutateAsync({ id: category.id, data });
			} else {
				onCreated?.(await createCategory.mutateAsync(data));
			}
			onDone();
		} catch (cause) {
			/*
			 * El 409 del nombre repetido llega con su mensaje escrito por el servidor
			 * —"Ya tenés una categoría con ese nombre"— y es el único error que el
			 * negocio puede arreglar desde acá, así que se muestra tal cual en lugar
			 * de taparlo con un genérico.
			 */
			setError(
				axios.isAxiosError(cause) &&
					typeof cause.response?.data?.message === 'string'
					? cause.response.data.message
					: 'No se pudo guardar la categoría. Intentá de nuevo.',
			);
		}
	};

	return (
		// `form` y no dos botones sueltos: así Enter en cualquiera de los dos campos
		// guarda, que es como se completa un formulario de dos líneas.
		<form
			className="space-y-4"
			onSubmit={(event) => {
				event.preventDefault();
				void handleSubmit();
			}}
		>
			<div>
				<Label htmlFor={nameId} className="mb-1.5 block">
					Nombre
					<span className="ml-0.5 text-destructive">*</span>
				</Label>
				<Input
					id={nameId}
					value={name}
					autoFocus
					placeholder="Cabello y peinado"
					maxLength={TEXT_MAX_LENGTH}
					onChange={(event) => setName(event.target.value)}
				/>
			</div>

			<div>
				<Label htmlFor={descriptionId} className="mb-1.5 block">
					Descripción
				</Label>
				<Input
					id={descriptionId}
					value={description}
					placeholder="Cortes, color y peinados"
					maxLength={TEXT_MAX_LENGTH}
					onChange={(event) => setDescription(event.target.value)}
				/>
				<div className="mt-1 flex items-start justify-between gap-3">
					<p className="text-xs text-muted-foreground">
						Opcional. Aclara qué servicios hay adentro.
					</p>
					<span
						className={cn(
							'shrink-0 font-mono text-xs tabular-nums',
							description.length >= TEXT_MAX_LENGTH
								? 'text-warning'
								: 'text-muted-foreground',
						)}
					>
						{`${description.length} / ${TEXT_MAX_LENGTH}`}
					</span>
				</div>
			</div>

			{error && (
				<p className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-destructive">
					{error}
				</p>
			)}

			<DialogFooter>
				<Button
					type="button"
					variant="outline"
					disabled={saving}
					onClick={onCancel}
				>
					Cancelar
				</Button>
				<Button type="submit" disabled={!trimmed || saving}>
					{saving && <Spinner className="size-3.5" />}
					{category ? 'Guardar' : 'Añadir'}
				</Button>
			</DialogFooter>
		</form>
	);
};

export default CategoryDialog;
