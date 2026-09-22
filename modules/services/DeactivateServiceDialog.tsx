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
 * Confirmación de dar de baja un servicio.
 *
 * Antes decía "eliminar", y era la única pieza de la pantalla que contaba lo que
 * de verdad pasaba: el servidor marca la fila como inactiva y la deja, así que
 * las citas que ya lo usaron siguen enteras —conservan su precio y su duración— y
 * los reportes de meses pasados no cambian.
 *
 * Ahora lo dice también el nombre de la acción, y por eso el texto puede cambiar
 * de tema: ya no hace falta desmentir la palabra "eliminar", sino contestar la
 * pregunta que queda —qué deja de pasar, y que se puede volver atrás—.
 *
 * Volver a activar no pasa por acá. Confirmar tiene sentido cuando lo que se
 * hace cuesta deshacer, y reactivar es exactamente el deshacer de esto.
 */
const DeactivateServiceDialog: React.FC<Props> = ({
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
					{`¿Desactivar ${service.name || 'este servicio'}?`}
				</AlertDialogTitle>
				<AlertDialogDescription>
					Sale del catálogo y deja de poder reservarse, en tu página y por
					WhatsApp. Las citas que ya lo usaron quedan intactas, con el precio y
					la duración que tenían. Podés volver a activarlo cuando quieras.
				</AlertDialogDescription>
			</AlertDialogHeader>

			<AlertDialogFooter>
				<AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
				<AlertDialogAction
					disabled={pending}
					onClick={onConfirm}
					className="bg-destructive hover:bg-destructive/90"
				>
					{pending ? 'Desactivando…' : 'Desactivar servicio'}
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
);

export default DeactivateServiceDialog;
