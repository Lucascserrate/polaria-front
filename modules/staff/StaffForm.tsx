'use client';

import { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type {
	CreateStaffDto,
	StaffMember,
	UpdateStaffDto,
} from '@/types/staff.types';
import useGetServices from '@/services/services/useGetServices';

interface StaffFormProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialStaff?: StaffMember | null;
	onSubmit: (staff: CreateStaffDto | UpdateStaffDto) => void;
}

export function StaffForm({
	open,
	onOpenChange,
	initialStaff,
	onSubmit,
}: StaffFormProps) {
	const [name, setName] = useState(() => initialStaff?.name ?? '');
	const [serviceIds, setServiceIds] = useState<string[]>(
		() => initialStaff?.services?.map((s) => s.id) ?? [],
	);

	const { data: servicesData } = useGetServices();

	const services = servicesData || [];

	const mode: 'create' | 'edit' = initialStaff ? 'edit' : 'create';

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name) return;
		onSubmit({ name, serviceIds });
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						{mode === 'create' ? 'Agregar personal' : 'Editar personal'}
					</DialogTitle>
					<DialogDescription>
						{mode === 'create'
							? 'Crea un nuevo miembro del staff y asigna los servicios.'
							: 'Actualiza el miembro del staff y los servicios que puede hacer.'}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<Label htmlFor="name">Nombre</Label>
						<Input
							id="name"
							placeholder="Ingresa el nombre"
							value={name}
							onChange={(e) => setName(e.target.value)}
						/>
					</div>

					<div className="space-y-2">
						<div className="flex items-center justify-between gap-2">
							<Label>Servicios</Label>
							{serviceIds.length > 0 ? (
								<Badge variant="secondary">
									{serviceIds.length} seleccionados
								</Badge>
							) : (
								<Badge variant="outline">Sin servicios</Badge>
							)}
						</div>

						<div className="border border-border rounded-lg p-3 space-y-2 max-h-56 overflow-auto">
							{services.length === 0 ? (
								<p className="text-sm text-muted-foreground">
									No hay servicios activos para asignar.
								</p>
							) : (
								services.map((service) => {
									const checked = serviceIds.includes(service.id);
									return (
										<label
											key={service.id}
											className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-accent cursor-pointer"
										>
											<Checkbox
												checked={checked}
												onCheckedChange={(next) => {
													const isChecked = next === true;
													setServiceIds((prev) => {
														if (isChecked) {
															return Array.from(new Set([...prev, service.id]));
														}
														return prev.filter((id) => id !== service.id);
													});
												}}
											/>
											<span className="text-sm">{service.name}</span>
										</label>
									);
								})
							)}
						</div>
					</div>

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
						>
							Cancelar
						</Button>
						<Button type="submit" disabled={!name}>
							{mode === 'create' ? 'Crear' : 'Guardar'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
