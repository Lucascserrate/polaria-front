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

interface Props {
	onAddService: (service: {
		name: string;
		durationMinutes: number;
		price: number;
	}) => void;
}

const ServiceForm: React.FC<Props> = ({ onAddService }) => {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState('');
	const [duration, setDuration] = useState('30');
	const [price, setPrice] = useState('0');

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !duration || !price) return;

		onAddService({
			name,
			durationMinutes: parseInt(duration),
			price: parseFloat(price),
		});

		setName('');
		setDuration('30');
		setPrice('0');
		setOpen(false);
	};

	return (
		<>
			<Button onClick={() => setOpen(true)} className="gap-2">
				<Plus className="w-4 h-4" />
				Agregar Servicio
			</Button>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Agregar Nuevo Servicio</DialogTitle>
						<DialogDescription>
							Añade un nuevo servicio al menú de tu barbería
						</DialogDescription>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<Label htmlFor="service-name">Nombre del Servicio</Label>
							<Input
								id="service-name"
								placeholder="p.ej., Corte, Afeitado"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>

						<div>
							<Label htmlFor="duration">Duración (minutos)</Label>
							<Input
								id="duration"
								type="number"
								min="5"
								max="180"
								step="5"
								placeholder="30"
								value={duration}
								onChange={(e) => setDuration(e.target.value)}
							/>
						</div>

						<div>
							<Label htmlFor="price">Precio</Label>
							<Input
								id="price"
								type="number"
								min="0"
								step="0.01"
								placeholder="0"
								value={price}
								onChange={(e) => setPrice(e.target.value)}
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
							<Button type="submit" disabled={!name || !duration || !price}>
								Agregar Servicio
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default ServiceForm;
