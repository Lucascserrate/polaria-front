'use client';

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import useGetServiceCategories from '@/services/service-categories/useGetServiceCategories';

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
 * **Sólo elige entre las que existen.** Acá hubo un botón para crear una sin
 * salir del servicio, y dejó de tener sentido cuando una categoría pasó a ser
 * algo más que un nombre: además de cómo se agrupa el menú decide con qué otras
 * se puede atender al mismo tiempo, y eso es una pantalla, no un campo al
 * costado. Se crean desde Servicios, que es donde se ven todas juntas.
 */
const CategoryField: React.FC<Props> = ({ value, onChange, id }) => {
	const { data: categories = [] } = useGetServiceCategories();

	return (
		<Select
			value={value || NONE}
			onValueChange={(next) => onChange(next === NONE ? '' : next)}
		>
			<SelectTrigger id={id} className="w-full">
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
	);
};

export default CategoryField;
