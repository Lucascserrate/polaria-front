'use client';

import { useEffect, useMemo, useState } from 'react';
import ServiceForm from '@/modules/services/ServiceForm';
import ServicesTable from '@/modules/services/ServiceTable';
import { servicesService } from '@/services/services.service';
import type { Service } from '@/types/services.types';

const ServicesPage = () => {
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState(true);
	const [addOpen, setAddOpen] = useState(false);
	const [editingService, setEditingService] = useState<Service | null>(null);
	const [editOpen, setEditOpen] = useState(false);

	const stats = useMemo(() => {
		const totals = services.reduce(
			(acc, service) => {
				const duration = Number(service.durationMinutes);
				const price = Number(service.price);

				if (Number.isFinite(duration)) {
					acc.totalDuration += duration;
					acc.durationCount += 1;
				}

				if (Number.isFinite(price)) {
					acc.totalPrice += price;
					acc.priceCount += 1;
				}

				return acc;
			},
			{
				totalDuration: 0,
				durationCount: 0,
				totalPrice: 0,
				priceCount: 0,
			},
		);

		return {
			averageDuration:
				totals.durationCount > 0
					? Math.round(totals.totalDuration / totals.durationCount)
					: 0,
			averagePrice:
				totals.priceCount > 0 ? totals.totalPrice / totals.priceCount : 0,
		};
	}, [services]);

	useEffect(() => {
		loadServices();
	}, []);

	const loadServices = async () => {
		try {
			setLoading(true);
			const data = await servicesService.getAll();
			setServices(data);
		} catch (error) {
			console.error('Error loading services:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await servicesService.delete(id);
			setServices(services.filter((s) => s.id !== id));
		} catch (error) {
			console.error('Error deleting service:', error);
		}
	};

	const handleAddService = async (newService: {
		name: string;
		durationMinutes: number;
		price: number;
		description?: string;
	}) => {
		try {
			const createdService = await servicesService.create({
				name: newService.name,
				description: newService.description,
				durationMinutes: newService.durationMinutes,
				price: newService.price,
				timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
				isActive: true,
			});
			setServices([...services, createdService]);
		} catch (error) {
			console.error('Error adding service:', error);
		}
	};

	const handleEdit = (service: Service) => {
		setEditingService(service);
		setEditOpen(true);
	};

	const handleUpdateService = async (updated: {
		name: string;
		durationMinutes: number;
		price: number;
		description?: string;
	}) => {
		if (!editingService) return;
		try {
			const saved = await servicesService.update(editingService.id, {
				name: updated.name,
				description: updated.description,
				durationMinutes: updated.durationMinutes,
				price: updated.price,
			});
			setServices(
				services.map((s) => (s.id === editingService.id ? saved : s)),
			);
			setEditOpen(false);
			setEditingService(null);
		} catch (error) {
			console.error('Error updating service:', error);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-lg">Cargando servicios...</div>
			</div>
		);
	}

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
				<ServiceForm
					onSubmit={handleAddService}
					open={addOpen}
					onOpenChange={setAddOpen}
				/>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Total de Servicios</p>
					<p className="text-2xl font-bold mt-1">{services.length}</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Duracion Promedio</p>
					<p className="text-2xl font-bold mt-1">{stats.averageDuration} min</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Precio Promedio</p>
					<p className="text-2xl font-bold mt-1">
						BOB {stats.averagePrice.toFixed(2)}
					</p>
				</div>
			</div>

			{/* Table */}
			<div className="bg-card border border-border rounded-lg p-6">
				<ServicesTable
					services={services}
					onDelete={handleDelete}
					onEdit={handleEdit}
					onAddClick={() => setAddOpen(true)}
				/>
			</div>

			<ServiceForm
				showTrigger={false}
				onSubmit={handleUpdateService}
				initialValues={editingService ?? undefined}
				title="Editar Servicio"
				description="Actualiza los datos del servicio"
				submitLabel="Guardar cambios"
				open={editOpen}
				onOpenChange={(open) => {
					setEditOpen(open);
					if (!open) setEditingService(null);
				}}
			/>
		</div>
	);
};

export default ServicesPage;
