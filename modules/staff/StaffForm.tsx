'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus } from 'lucide-react';
import { MOCK_SERVICES } from '@/lib/mocks';

interface StaffFormProps {
	onAddStaff: (staff: { name: string; services: string[] }) => void;
}

export function StaffForm({ onAddStaff }: StaffFormProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState('');
	const [selectedServices, setSelectedServices] = useState<string[]>([]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || selectedServices.length === 0) return;

		onAddStaff({
			name,
			services: selectedServices.map(
				(id) => MOCK_SERVICES.find((s) => s.id === id)?.name || '',
			),
		});

		setName('');
		setSelectedServices([]);
		setOpen(false);
	};

	const toggleService = (serviceId: string) => {
		setSelectedServices((prev) =>
			prev.includes(serviceId)
				? prev.filter((id) => id !== serviceId)
				: [...prev, serviceId],
		);
	};

	return (
		<>
			<Button onClick={() => setOpen(true)} className="gap-2">
				<Plus className="w-4 h-4" />
				Agregar personal
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Agregar nuevo miembro del personal</DialogTitle>
						<DialogDescription>
							Agrega un nuevo barbero a tu barbería
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label htmlFor="name">Nombre</Label>
							<Input
								id="name"
								placeholder="Ingresa el nombre del barbero"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>

						<div>
							<Label className="mb-3 block">Servicios</Label>
							<div className="space-y-2">
								{MOCK_SERVICES.map((service) => (
									<div key={service.id} className="flex items-center gap-2">
										<Checkbox
											id={`service-${service.id}`}
											checked={selectedServices.includes(service.id)}
											onCheckedChange={() => toggleService(service.id)}
										/>
										<Label
											htmlFor={`service-${service.id}`}
											className="cursor-pointer font-normal"
										>
											{service.name}
										</Label>
									</div>
								))}
							</div>
						</div>

						<div className="flex justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								disabled={!name || selectedServices.length === 0}
							>
								Agregar
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
