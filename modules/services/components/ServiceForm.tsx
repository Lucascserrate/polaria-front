'use client';

import { useMemo, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import type { VariantProps } from 'class-variance-authority';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import type { Service } from '@/types/services.types';
import ServiceFormFields from '@/modules/services/components/ServiceFormFields';

interface Props {
	onSubmit: (service: {
		name: string;
		durationMinutes: number;
		price: number;
		description?: string;
	}) => void | Promise<void>;
	initialValues?: Partial<Service>;
	title?: string;
	description?: string;
	submitLabel?: string;
	showTrigger?: boolean;
	triggerLabel?: string;
	triggerVariant?: VariantProps<typeof buttonVariants>['variant'];
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

const ServiceForm: React.FC<Props> = ({
	onSubmit,
	initialValues,
	title = 'Agregar Nuevo Servicio',
	description = 'Añade un nuevo servicio al menú de tu barbería',
	submitLabel = 'Agregar Servicio',
	showTrigger = true,
	triggerLabel = 'Agregar Servicio',
	triggerVariant = 'default',
	open: controlledOpen,
	onOpenChange,
}) => {
	const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
	const isControlled = typeof controlledOpen === 'boolean' && !!onOpenChange;
	const open = isControlled ? controlledOpen : uncontrolledOpen;
	const setOpen = isControlled ? onOpenChange : setUncontrolledOpen;

	const defaults = useMemo(() => {
		return {
			name: initialValues?.name ?? '',
			duration: String(initialValues?.durationMinutes ?? 30),
			price: String(initialValues?.price ?? 0),
			description: initialValues?.description ?? '',
		};
	}, [initialValues]);

	const formKey = `${open ? 'open' : 'closed'}-${initialValues?.id ?? 'new'}`;

	const handleOpenChange = (nextOpen: boolean) => {
		setOpen(nextOpen);
	};

	return (
		<>
			{showTrigger && (
				<Button
					onClick={() => setOpen(true)}
					className="gap-2"
					variant={triggerVariant}
				>
					<Plus className="w-4 h-4" />
					{triggerLabel}
				</Button>
			)}

			<Dialog open={open} onOpenChange={handleOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{title}</DialogTitle>
						<DialogDescription>{description}</DialogDescription>
					</DialogHeader>

					<ServiceFormFields
						key={formKey}
						defaults={defaults}
						submitLabel={submitLabel}
						onSubmit={onSubmit}
						onClose={() => setOpen(false)}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default ServiceForm;
