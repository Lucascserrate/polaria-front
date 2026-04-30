'use client';

import AppointmentsTable from '@/modules/appointments/AppointmentTable';
import { useAppointments } from '@/modules/appointments/hooks/useAppointments';

const AppointmentsPage = () => {
	const {
		appointments,
		loading,
		loadingMore,
		isRefetching,
		hasMore,
		stats,
		filters,
		loadMore,
		changeFilters,
		changeStatus,
	} = useAppointments();

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Todas las Citas</h1>
					<p className="text-muted-foreground mt-1">
						Visualiza y gestiona todas tus citas programadas
					</p>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Total de Citas</p>
					<p className="text-2xl font-bold mt-1">{stats.total}</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Confirmadas</p>
					<p className="text-2xl font-bold mt-1 text-blue-600">
						{stats.confirmed}
					</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Completadas</p>
					<p className="text-2xl font-bold mt-1 text-green-600">
						{stats.completed}
					</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Canceladas</p>
					<p className="text-2xl font-bold mt-1 text-red-600">
						{stats.cancelled}
					</p>
				</div>
			</div>

			{/* Table */}
			<div className="bg-card border border-border rounded-lg p-6 max-h-screen overflow-y-auto relative">
				{isRefetching && (
					<div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md z-10">
						Actualizando...
					</div>
				)}
				
				{loading && appointments.length === 0 ? (
					<div className="text-center text-muted-foreground">
						Cargando citas...
					</div>
				) : (
					<AppointmentsTable
						appointments={appointments}
						onStatusChange={changeStatus}
						hasMore={hasMore}
						isFetchingNextPage={loadingMore}
						onLoadMore={loadMore}
						onFiltersChange={changeFilters}
						filters={filters}
					/>
				)}
			</div>
		</div>
	);
};

export default AppointmentsPage;
