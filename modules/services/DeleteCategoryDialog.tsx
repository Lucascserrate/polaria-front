'use client';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { ServiceCategory } from '@/types/service-categories.types';

interface Props {
	category: ServiceCategory;
	/** Cuántos servicios quedarían sin categoría. */
	serviceCount: number;
	open: boolean;
	pending?: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

/** Qué le pasa al catálogo si se borra esta categoría. */
const describeWhatHappens = (serviceCount: number): string => {
	if (serviceCount === 0) {
		return 'La categoría está vacía, así que no cambia nada más.';
	}

	if (serviceCount === 1) {
		return 'El servicio que tiene no se elimina: queda sin categoría y se sigue pudiendo reservar.';
	}

	return `Los ${serviceCount} servicios que tiene no se eliminan: quedan sin categoría y se siguen pudiendo reservar.`;
};

/**
 * Confirmación de eliminación de una categoría.
 *
 * Lo que hay que despejar es el miedo razonable de que borrar el grupo borre lo
 * que tiene adentro: no lo borra, los servicios quedan sin categoría y se siguen
 * reservando igual. Sin decirlo, un dueño con veinte servicios en "Cabello" no
 * toca ese botón nunca.
 *
 * Por eso se dice cuántos son y no sólo que "los servicios se conservan": entre
 * las dos frases, la que se cree es la que trae el número.
 */
const DeleteCategoryDialog: React.FC<Props> = ({
	category,
	serviceCount,
	open,
	pending = false,
	onOpenChange,
	onConfirm,
}) => (
	<AlertDialog open={open} onOpenChange={onOpenChange}>
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>{`¿Eliminar ${category.name}?`}</AlertDialogTitle>
				<AlertDialogDescription>
					{describeWhatHappens(serviceCount)}
				</AlertDialogDescription>
			</AlertDialogHeader>

			<AlertDialogFooter>
				<AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
				<AlertDialogAction
					disabled={pending}
					onClick={onConfirm}
					className="bg-destructive hover:bg-destructive/90"
				>
					{pending ? 'Eliminando…' : 'Eliminar categoría'}
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
);

export default DeleteCategoryDialog;
