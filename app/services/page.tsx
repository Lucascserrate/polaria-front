'use client';

import { useState } from 'react';
import { MOCK_SERVICES } from '@/lib/mocks';
import ServiceForm from '@/modules/services/ServiceForm';
import ServicesTable from '@/modules/services/ServiceTable';

interface Service {
	id: string;
	name: string;
	durationMinutes: number;
	price: number;
}

const ServicesPage = () => {
	const [services, setServices] = useState<Service[]>(MOCK_SERVICES);

	const handleDelete = (id: string) => {
		setServices(services.filter((s) => s.id !== id));
	};

	const handleAddService = (newService: {
		name: string;
		durationMinutes: number;
		price: number;
	}) => {
		const service: Service = {
			id: String(Math.max(...services.map((s) => parseInt(s.id)), 0) + 1),
			name: newService.name,
			durationMinutes: newService.durationMinutes,
			price: newService.price,
		};
		setServices([...services, service]);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Gestión de Servicios
					</h1>
					<p className="text-muted-foreground mt-1">
						Gestiona los servicios y precios de tu barbería
					</p>
				</div>
				<ServiceForm onAddService={handleAddService} />
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Total de Servicios</p>
					<p className="text-2xl font-bold mt-1">{services.length}</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Duración Promedio</p>
					<p className="text-2xl font-bold mt-1">
						{services.length > 0
							? Math.round(
									services.reduce((sum, s) => sum + s.durationMinutes, 0) /
										services.length,
								)
							: 0}{' '}
						min
					</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Precio Promedio</p>
					<p className="text-2xl font-bold mt-1">
						BOB{' '}
						{services.length > 0
							? (
									services.reduce((sum, s) => sum + s.price, 0) /
									services.length
								).toFixed(2)
							: '0.00'}
					</p>
				</div>
			</div>

			{/* Table */}
			<div className="bg-card border border-border rounded-lg p-6">
				<ServicesTable
					services={services}
					onDelete={handleDelete}
					onAddClick={() => {}}
				/>
			</div>
		</div>
	);
};

export default ServicesPage;
