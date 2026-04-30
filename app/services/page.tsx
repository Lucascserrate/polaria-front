'use client';

import ServiceForm from '@/modules/services/components/ServiceForm';
import ServicesTable from '@/modules/services/components/ServiceTable';
import { useServices } from '@/modules/services/hooks/useServices';

const ServicesPage = () => {
	const {
		services,
		loading,
		stats,
		addOpen,
		setAddOpen,
		editOpen,
		editingService,
		openEdit,
		closeEdit,
		createService,
		updateService,
		toggleActive,
	} = useServices();

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
					onSubmit={createService}
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
					onToggleActive={toggleActive}
					onEdit={openEdit}
					onAddClick={() => setAddOpen(true)}
				/>
			</div>

			<ServiceForm
				showTrigger={false}
				onSubmit={updateService}
				initialValues={editingService ?? undefined}
				title="Editar Servicio"
				description="Actualiza los datos del servicio"
				submitLabel="Guardar cambios"
				open={editOpen}
				onOpenChange={(open) => {
					if (!open) closeEdit();
				}}
			/>
		</div>
	);
};

export default ServicesPage;
