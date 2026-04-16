import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Props {
	open: boolean;
	setOpen: (open: boolean) => void;
	onConfirm: () => void;
}

const DeleteConfirmationDialog: React.FC<Props> = ({
	open,
	setOpen,
	onConfirm,
}) => {
	return (
		<AlertDialog open={open} onOpenChange={(open) => setOpen(open)}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>¿Eliminar cita?</AlertDialogTitle>
					<AlertDialogDescription>
						Esta acción no se puede deshacer. ¿Estás seguro de que deseas
						eliminar esta cita?
					</AlertDialogDescription>
				</AlertDialogHeader>
				<div className="flex gap-2 justify-end">
					<AlertDialogCancel>Cancelar</AlertDialogCancel>
					<AlertDialogAction
						onClick={() => onConfirm()}
						className="bg-destructive hover:bg-destructive/90"
					>
						Eliminar
					</AlertDialogAction>
				</div>
			</AlertDialogContent>
		</AlertDialog>
	);
};

export default DeleteConfirmationDialog;
