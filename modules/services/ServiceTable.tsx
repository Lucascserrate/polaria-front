'use client';

import { Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

interface Service {
	id: string;
	name: string;
	durationMinutes: number;
	price: number;
}

interface Props {
	services: Service[];
	onDelete: (id: string) => void;
	onAddClick: () => void;
}

const ServicesTable: React.FC<Props> = ({ services, onDelete, onAddClick }) => {
	if (services.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground mb-4">
					No hay servicios añadidos aún
				</p>
				<Button onClick={onAddClick}>
					<Plus className="w-4 h-4 mr-2" />
					Agregar Servicio
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Desktop Table */}
			<div className="hidden md:block border border-border rounded-lg overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Nombre del Servicio</TableHead>
							<TableHead>Duración</TableHead>
							<TableHead>Precio</TableHead>
							<TableHead className="text-right">Acciones</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{services.map((service) => (
							<TableRow key={service.id}>
								<TableCell className="font-medium">{service.name}</TableCell>
								<TableCell>{service.durationMinutes} minutos</TableCell>
								<TableCell>${service.price.toFixed(2)}</TableCell>
								<TableCell className="text-right">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => onDelete(service.id)}
									>
										<Trash2 className="w-4 h-4 text-destructive" />
									</Button>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Mobile Cards */}
			<div className="md:hidden space-y-3">
				{services.map((service) => (
					<div
						key={service.id}
						className="bg-card border border-border rounded-lg p-4 space-y-3"
					>
						<div className="flex items-start justify-between">
							<div>
								<p className="font-medium">{service.name}</p>
								<p className="text-sm text-muted-foreground mt-1">
									{service.durationMinutes} minutos
								</p>
								<p className="text-sm font-semibold mt-1">
									${service.price.toFixed(2)}
								</p>
							</div>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => onDelete(service.id)}
							>
								<Trash2 className="w-4 h-4 text-destructive" />
							</Button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ServicesTable;
