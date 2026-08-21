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
import type { StaffMember } from '@/types/staff.types';

interface Props {
	staff: StaffMember | null;
	onOpenChange: (open: boolean) => void;
	onConfirm: (staff: StaffMember) => void;
	pending?: boolean;
}

/**
 * Confirmación de eliminación de un profesional.
 *
 * Dice de antemano qué va a pasar, porque las dos salidas son muy distintas y
 * una no se puede deshacer. Los conteos vienen en el listado justamente para
 * poder anticiparlo en lugar de contarlo después.
 */
const DeleteStaffDialog: React.FC<Props> = ({
	staff,
	onOpenChange,
	onConfirm,
	pending = false,
}) => {
	if (!staff) return null;

	const futureCount = staff.futureAppointmentCount ?? 0;
	const hasHistory = (staff.appointmentCount ?? 0) > 0;
	const blocked = futureCount > 0;

	return (
		<AlertDialog open onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>
						{blocked
							? `${staff.name} tiene citas próximas`
							: `¿Eliminar a ${staff.name}?`}
					</AlertDialogTitle>
					<AlertDialogDescription asChild>
						<div className="space-y-2 text-sm text-muted-foreground">
							{blocked ? (
								<>
									<p>
										Tiene {futureCount}{' '}
										{futureCount === 1 ? 'cita' : 'citas'} por delante. Esas
										citas son un compromiso con clientes que ya recibieron su
										confirmación.
									</p>
									<p>
										Reasignalas a otro profesional o cancelalas, y después
										eliminá el perfil.
									</p>
								</>
							) : hasHistory ? (
								<>
									<p>
										Tiene historial de citas, así que se da de baja en lugar de
										borrarse: sus citas, servicios, comisiones y todo lo que ya
										aportó a la contabilidad quedan intactos.
									</p>
									<p>
										Deja de aparecer en el equipo y de ofrecerse para reservas
										nuevas.
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
					{!blocked && (
						<AlertDialogAction
							disabled={pending}
							className="bg-destructive hover:bg-destructive/90"
							onClick={() => onConfirm(staff)}
						>
							{hasHistory ? 'Dar de baja' : 'Eliminar'}
						</AlertDialogAction>
					)}
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default DeleteStaffDialog;
