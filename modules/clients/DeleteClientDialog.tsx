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
import type { ClientApi, ClientSummaryApi } from '@/types/appointments.types';

interface Props {
	client: ClientApi;
	/** Ausente mientras cargan los números: sin ellos no se puede anticipar nada. */
	summary?: ClientSummaryApi;
	open: boolean;
	pending?: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
}

/**
 * Confirmación de eliminación de un cliente.
 *
 * Dice de antemano cuál de las tres cosas va a pasar, y no después. Los números
 * salen del mismo resumen que muestra la ficha, así que no hace falta intentar
 * el borrado para enterarse: descubrir por un error que el cliente tenía dos
 * turnos reservados es descubrirlo tarde.
 *
 * La diferencia entre borrar y dar de baja importa más acá que en el equipo:
 * `appointments.clientId` borra en cascada, así que un borrado físico sobre
 * alguien con historial se llevaría sus citas y lo facturado en ellas.
 */
const DeleteClientDialog: React.FC<Props> = ({
	client,
	summary,
	open,
	pending = false,
	onOpenChange,
	onConfirm,
}) => {
	const name = client.name || 'este cliente';
	const future = summary?.futureAppointments ?? 0;
	const hasHistory = (summary?.totalAppointments ?? 0) > 0;
	const blocked = future > 0;

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{blocked ? `${name} tiene citas próximas` : `¿Eliminar a ${name}?`}
					</AlertDialogTitle>
					<AlertDialogDescription asChild>
						<div className="space-y-2 text-sm text-muted-foreground">
							{!summary ? (
								<p>Revisando su historial…</p>
							) : blocked ? (
								<>
									<p>
										Tiene {future} {future === 1 ? 'cita' : 'citas'} por
										delante. El negocio le reservó ese horario y la persona ya
										recibió su confirmación.
									</p>
									<p>
										Cancelá esas citas desde la agenda y después eliminá la
										ficha.
									</p>
								</>
							) : hasHistory ? (
								<>
									<p>
										Tiene historial de citas, así que se da de baja en lugar de
										borrarse: sus citas y lo que se le facturó quedan intactos.
									</p>
									<p>
										Deja de aparecer en la lista. Si vuelve a reservar por
										WhatsApp o desde la página, se reactiva sola con todo su
										historial.
									</p>
								</>
							) : (
								<p>
									Nunca tuvo citas, así que se elimina definitivamente. No hay
									historial que conservar y{' '}
									<strong className="text-foreground">
										esta acción no se puede deshacer
									</strong>
									.
								</p>
							)}
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>
						{blocked ? 'Entendido' : 'Cancelar'}
					</AlertDialogCancel>
					{summary && !blocked && (
						<AlertDialogAction
							disabled={pending}
							className="bg-destructive hover:bg-destructive/90"
							onClick={onConfirm}
						>
							{hasHistory ? 'Dar de baja' : 'Eliminar'}
						</AlertDialogAction>
					)}
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default DeleteClientDialog;
