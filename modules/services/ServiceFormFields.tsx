'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type SubmitPayload = {
	name: string;
	durationMinutes: number;
	price: number;
	description?: string;
};

const ServiceFormFields: React.FC<{
	defaults: {
		name: string;
		duration: string;
		price: string;
		description: string;
	};
	submitLabel: string;
	onSubmit: (payload: SubmitPayload) => void;
	onClose: () => void;
}> = ({ defaults, submitLabel, onSubmit, onClose }) => {
	const [name, setName] = useState(defaults.name);
	const [duration, setDuration] = useState(defaults.duration);
	const [price, setPrice] = useState(defaults.price);
	const [serviceDescription, setServiceDescription] = useState(
		defaults.description,
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name || !duration || !price) return;

		onSubmit({
			name,
			durationMinutes: parseInt(duration),
			price: parseFloat(price),
			description: serviceDescription || undefined,
		});

		onClose();
	};

	return (
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
				<Label htmlFor="duration">Duracion (minutos)</Label>
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

			<div>
				<Label htmlFor="description">Descripcion (opcional)</Label>
				<Input
					id="description"
					placeholder="Detalle del servicio"
					value={serviceDescription}
					onChange={(e) => setServiceDescription(e.target.value)}
				/>
			</div>

			<div className="flex justify-end gap-2 pt-4">
				<Button type="button" variant="outline" onClick={onClose}>
					Cancelar
				</Button>
				<Button type="submit" disabled={!name || !duration || !price}>
					{submitLabel}
				</Button>
			</div>
		</form>
	);
};

export default ServiceFormFields;
