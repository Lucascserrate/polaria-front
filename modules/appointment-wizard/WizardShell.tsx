'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';

interface Props {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** La pregunta del paso actual. */
	title: string;
	/** Contexto fijo del diálogo: en Agenda, el día que se está viendo. */
	description?: React.ReactNode;
	/** Lo ya elegido, para no perder el hilo entre pasos. */
	summary?: React.ReactNode;
	/** Ausente en el primer paso: ahí el botón izquierdo cancela. */
	onBack?: () => void;
	/** Acción principal del paso. Los pasos intermedios avanzan al elegir. */
	action?: React.ReactNode;
	children: React.ReactNode;
}

/**
 * Marco común de los formularios por pasos: encabezado, resumen, cuerpo y
 * botonera.
 *
 * No sabe cuántos pasos hay ni cuáles son. Eso lo decide cada contexto: Agenda
 * pregunta cliente, servicio, profesional y hora; un registro histórico
 * necesitaría además la fecha. Acá solo vive lo que no cambia entre los dos.
 */
const WizardShell: React.FC<Props> = ({
	open,
	onOpenChange,
	title,
	description,
	summary,
	onBack,
	action,
	children,
}) => {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					{description && (
						<DialogDescription className="capitalize">
							{description}
						</DialogDescription>
					)}
				</DialogHeader>

				{summary && (
					<p className="text-xs text-muted-foreground">{summary}</p>
				)}

				{/* Alto mínimo fijo: sin esto el diálogo salta de tamaño en cada paso. */}
				<div className="min-h-56 space-y-3">{children}</div>

				<div className="flex items-center justify-between gap-2 border-t border-border pt-4">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={onBack ?? (() => onOpenChange(false))}
					>
						{onBack ? (
							<>
								<ArrowLeft className="mr-1 h-4 w-4" />
								Atrás
							</>
						) : (
							'Cancelar'
						)}
					</Button>

					{action}
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default WizardShell;
