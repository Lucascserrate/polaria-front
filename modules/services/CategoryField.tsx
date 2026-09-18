'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import useGetServiceCategories from '@/services/service-categories/useGetServiceCategories';
import CategoryDialog from './CategoryDialog';

/**
 * El valor del `<select>` para "sin categoría".
 *
 * Un centinela y no cadena vacía porque Radix reserva `""` para "no hay nada
 * elegido" y se niega a renderizar un item con ese valor. La traducción de ida y
 * vuelta pasa toda por acá; afuera, sin categoría sigue siendo cadena vacía.
 */
const NONE = 'none';

interface Props {
	/** El id de la categoría elegida, o cadena vacía. */
	value: string;
	onChange: (value: string) => void;
	/** Lo inyecta `Field`. */
	id?: string;
}

/**
 * En qué grupo del catálogo cae este servicio.
 *
 * Sin categoría es una opción de la lista y no la ausencia de elección: es lo que
 * tiene la mayoría de los servicios y va a seguir estando bien, así que se ve
 * escrito en lugar de quedar como un campo vacío que parece incompleto.
 *
 * Crear una categoría se puede desde acá porque el momento en que se descubre que
 * hace falta es justo este: alguien está cargando el décimo servicio y se da
 * cuenta de que la lista ya no se lee. Mandarlo a otra pantalla es hacerle perder
 * lo que estaba escribiendo.
 */
const CategoryField: React.FC<Props> = ({ value, onChange, id }) => {
	const { data: categories = [] } = useGetServiceCategories();
	const [creating, setCreating] = useState(false);

	return (
		<>
			<div className="flex gap-2">
				<Select
					value={value || NONE}
					onValueChange={(next) => onChange(next === NONE ? '' : next)}
				>
					<SelectTrigger id={id} className="flex-1">
						<SelectValue />
					</SelectTrigger>
					<SelectContent className="max-h-72">
						<SelectItem value={NONE}>Sin categoría</SelectItem>
						{categories.map((category) => (
							<SelectItem key={category.id} value={category.id}>
								{category.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>

				<Button
					type="button"
					variant="outline"
					size="icon"
					aria-label="Añadir categoría"
					onClick={() => setCreating(true)}
				>
					<Plus className="size-4" />
				</Button>
			</div>

			{/*
			 * La recién creada queda elegida. Crearla desde acá es un rodeo para
			 * poder asignarla, y dejar el campo en "Sin categoría" obligaría a
			 * repetir la elección justo después de haberla hecho.
			 */}
			<CategoryDialog
				open={creating}
				onOpenChange={setCreating}
				onCreated={(category) => onChange(category.id)}
			/>
		</>
	);
};

export default CategoryField;
