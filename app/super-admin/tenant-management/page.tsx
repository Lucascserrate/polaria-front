'use client';

import { Plus } from 'lucide-react';

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TenantForm } from '@/modules/tenants/TenantForm';
import { TenantTable } from '@/modules/tenants/TenantTable';
import { useTenantManagement } from '@/modules/tenants/hooks/useTenantManagement';

export default function TenantManagementPage() {
	const { state, derived, actions } = useTenantManagement();
	const { formOpen, editingTenant, tenantToDelete, submissionError } = state;
	const { tenants, isLoading, isError, error, formSeed, activeCount, inactiveCount } =
		derived;
	const {
		handleOpenCreate,
		handleOpenEdit,
		handleDeleteRequest,
		handleDelete,
		handleSubmit,
		handleFormOpenChange,
		handleDeleteDialogChange,
	} = actions;

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="text-lg">Cargando tenants...</div>
			</div>
		);
	}

	if (isError) {
		return (
			<div className="flex h-64 items-center justify-center">
				<div className="text-lg text-red-600">
					Error cargando tenants: {error instanceof Error ? error.message : 'Error inesperado'}
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-7xl space-y-6 px-6 py-6">
			<div className="space-y-1">
				<h1 className="text-3xl font-bold tracking-tight">Tenant Management</h1>
				<p className="max-w-2xl text-muted-foreground">
					Administra la información base de cada tenant desde una vista interna
					preparada para futuras reglas de seguridad por roles.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Total tenants
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold">{tenants.length}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Activos
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold text-green-600">{activeCount}</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-medium text-muted-foreground">
							Inactivos
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-2xl font-bold text-muted-foreground">{inactiveCount}</p>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between">
					<CardTitle>Negocios</CardTitle>

					<Button onClick={handleOpenCreate} className="gap-2">
						<Plus className="h-4 w-4" />
						Crear negocio
					</Button>
				</CardHeader>

				<CardContent className="p-6">
					<TenantTable
						tenants={tenants}
						onAddClick={handleOpenCreate}
						onEdit={handleOpenEdit}
						onDelete={handleDeleteRequest}
					/>
				</CardContent>
			</Card>

			{submissionError && (
				<div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
					{submissionError}
				</div>
			)}

			<AlertDialog
				open={Boolean(tenantToDelete)}
				onOpenChange={handleDeleteDialogChange}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Eliminar tenant</AlertDialogTitle>
						<AlertDialogDescription>
							¿Eliminar el tenant{tenantToDelete ? ` "${tenantToDelete.name}"` : ''}? Esta acción no se puede deshacer.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancelar</AlertDialogCancel>
						<AlertDialogAction onClick={handleDelete}>Eliminar</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<TenantForm
				key={`${editingTenant?.id ?? 'create'}-${formSeed}`}
				open={formOpen}
				onOpenChange={handleFormOpenChange}
				initialTenant={editingTenant}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
