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
import type { Service } from '@/types/services.types';

interface Props {
	service: Service;
	open: boolean;
	pending?: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

/**
 * Confirmación de eliminación de un servicio.
 *
 * Dice lo que realmente pasa, que no es lo que "eliminar" sugiere: el servidor lo
 * marca como inactivo y deja la fila, así que las citas que ya lo usaron siguen
 * enteras —conservan su precio y su duración— y los reportes de meses pasados no
 * cambian. Lo que se pierde es que se pueda volver a reservar.
 *
 * Se aclara porque la alternativa es que el dueño no borre nada por miedo a
 * romper su historial, o que lo borre creyendo que no pasa nada y después no
 * entienda por qué el servicio ya no aparece en ninguna parte.
 */
const DeleteServiceDialog: React.FC<Props> = ({
	service,
	open,
	pending = false,
	onOpenChange,
	onConfirm,
}) => (
	<AlertDialog open={open} onOpenChange={onOpenChange}>
		<AlertDialogContent>
			<AlertDialogHeader>
				<AlertDialogTitle>
					{`¿Eliminar ${service.name || 'este servicio'}?`}
				</AlertDialogTitle>
				<AlertDialogDescription>
					Deja de poder reservarse y sale del catálogo. Las citas que ya lo
					usaron quedan intactas, con el precio y la duración que tenían.
				</AlertDialogDescription>
			</AlertDialogHeader>

			<AlertDialogFooter>
				<AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
				<AlertDialogAction
					disabled={pending}
					onClick={onConfirm}
					className="bg-destructive hover:bg-destructive/90"
				>
					{pending ? 'Eliminando…' : 'Eliminar servicio'}
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
);

export default DeleteServiceDialog;
