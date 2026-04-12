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
import { Plus } from 'lucide-react';
import type { CreateStaffDto } from '@/types/staff.types';

interface StaffFormProps {
	onAddStaff: (staff: CreateStaffDto) => void;
}

export function StaffForm({ onAddStaff }: StaffFormProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name) return;

		onAddStaff({ name, email });

		setName('');
		setEmail('');
		setOpen(false);
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
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="Ingresa el email del barbero"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div className="flex justify-end gap-2 pt-4">
							<Button
								type="button"
								variant="outline"
								onClick={() => setOpen(false)}
							>
								Cancelar
							</Button>
							<Button type="submit" disabled={!name}>
								Agregar
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
}
