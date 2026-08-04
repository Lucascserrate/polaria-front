import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { StaffMember } from '@/types/staff.types';

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	staff: StaffMember | null;
	error: string | null;
	onConfirm: () => void;
}

export function DeleteStaffDialog({
	open,
	onOpenChange,
	staff,
	error,
	onConfirm,
}: Props) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Eliminar personal?</AlertDialogTitle>
					<AlertDialogDescription>
						{error ? (
							error
						) : (
							<>
								Esta accion no se puede deshacer.{' '}
								{staff?.name
									? `Se eliminara a ${staff.name}.`
									: 'Seguro que deseas eliminar este miembro del staff?'}
							</>
						)}
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div className="flex gap-2 justify-end">
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					{!error && (
						<Button
							variant="destructive"
							onClick={(event) => {
								event.preventDefault();
								onConfirm();
							}}
						>
							Eliminar
						</Button>
					)}
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
}
