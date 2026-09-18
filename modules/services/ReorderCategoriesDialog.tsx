'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type {
	MoveDirection,
	ServiceCategory,
} from '@/types/service-categories.types';
import useMoveServiceCategory from '@/services/service-categories/useMoveServiceCategory';

interface Props {
	categories: ServiceCategory[];
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * El orden en que se muestran las categorías.
 *
 * No es una preferencia del panel: es el orden del menú que ve el cliente en
 * WhatsApp cuando el catálogo no entra en una sola lista. Lo que más se pide va
 * primero, y eso no lo sabe el alfabeto.
 *
 * Con flechas y no arrastrando, por lo mismo que el reordenado de fotos: el
 * arrastre es lo más difícil de acertar en un teléfono, y hay negocios usando el
 * panel sin rueda de mouse. Dos botones se tocan igual en cualquier lado.
 *
 * Cada movimiento se guarda solo. No hay botón de confirmar porque no hay nada
 * que confirmar: se ve el resultado en el acto y se sigue tocando hasta que
 * quede. Un "Guardar" abajo obligaría a acordarse de apretarlo y dejaría un
 * estado a medio camino si alguien cierra el diálogo.
 */
const ReorderCategoriesDialog: React.FC<Props> = ({
	categories,
	open,
	onOpenChange,
}) => {
	const move = useMoveServiceCategory();

	const mover = (id: string, direction: MoveDirection) => {
		if (move.isPending) return;
		move.mutate({ id, direction });
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Ordenar categorías</DialogTitle>
					<DialogDescription>
						Es el orden en que las ve tu cliente al reservar por WhatsApp. Poné
						primero lo que más te piden.
					</DialogDescription>
				</DialogHeader>

				<ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
					{categories.map((category, index) => (
						<li key={category.id} className="flex items-center gap-2 px-3 py-2">
							<span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
								{index + 1}
							</span>
							<span className="min-w-0 flex-1 truncate text-sm font-medium">
								{category.name}
							</span>

							<Button
								variant="ghost"
								size="icon-sm"
								aria-label={`Subir ${category.name}`}
								disabled={index === 0 || move.isPending}
								onClick={() => mover(category.id, 'UP')}
							>
								<ArrowUp className="size-4" />
							</Button>
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label={`Bajar ${category.name}`}
								disabled={index === categories.length - 1 || move.isPending}
								onClick={() => mover(category.id, 'DOWN')}
							>
								<ArrowDown className="size-4" />
							</Button>
						</li>
					))}
				</ul>

				{move.isError && (
					<p className="text-sm text-destructive">
						No se pudo cambiar el orden. Intentá de nuevo.
					</p>
				)}

				<DialogFooter>
					<Button onClick={() => onOpenChange(false)}>Listo</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default ReorderCategoriesDialog;
