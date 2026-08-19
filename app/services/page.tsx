'use client';

import ServiceForm from '@/modules/services/ServiceForm';
import ServicesTable from '@/modules/services/ServiceTable';
import useServicesPage from '../../modules/services/hooks/useServicesPage';

const ServicesPage = () => {
	const {
		services,
		isPending,
		isError,
		error,
		stats,
		addOpen,
		setAddOpen,
		editOpen,
		handleEditOpenChange,
		editingService,
		handleDelete,
		handleAddService,
		handleEdit,
		handleUpdateService,
		createServiceMutation,
		updateServiceMutation,
		deleteServiceMutation,
	} = useServicesPage();

	if (isPending) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-lg">Cargando servicios...</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-lg text-destructive">
					{error?.message ?? 'No se pudieron cargar los servicios.'}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
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
					isSubmitting={createServiceMutation.isPending}
					errorMessage={
						createServiceMutation.isError
							? createServiceMutation.error?.message
							: undefined
					}
				/>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Total de Servicios</p>
					<p className="text-2xl font-bold mt-1">{services.length}</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Duración Promedio</p>
					<p className="text-2xl font-bold mt-1">{stats.averageDuration} min</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Precio Promedio</p>
					<p className="text-2xl font-bold mt-1">
						BOB {stats.averagePrice.toFixed(2)}
					</p>
				</div>
			</div>

			<div className="bg-card border border-border rounded-lg p-6">
				<ServicesTable
					services={services}
					onDelete={handleDelete}
					onEdit={handleEdit}
					onAddClick={() => setAddOpen(true)}
					disableActions={
						createServiceMutation.isPending ||
						updateServiceMutation.isPending ||
						deleteServiceMutation.isPending
					}
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
				onOpenChange={handleEditOpenChange}
				isSubmitting={updateServiceMutation.isPending}
				errorMessage={
					updateServiceMutation.isError
						? updateServiceMutation.error?.message
						: undefined
				}
			/>
		</div>
	);
};

export default ServicesPage;
