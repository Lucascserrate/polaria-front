'use client';

import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TenantForm } from '@/modules/tenants/TenantForm';
import { TenantTable } from '@/modules/tenants/TenantTable';
import useCreateTenant from '@/modules/tenants/hooks/useCreateTenant';
import useDeleteTenant from '@/modules/tenants/hooks/useDeleteTenant';
import useTenants from '@/modules/tenants/hooks/useTenants';
import useUpdateTenant from '@/modules/tenants/hooks/useUpdateTenant';
import type { CreateTenantDto, Tenant, UpdateTenantDto } from '@/types/tenant.types';

export default function TenantManagementPage() {
	const { data: tenants = [], isLoading, isError, error } = useTenants();
	const createTenant = useCreateTenant();
	const updateTenant = useUpdateTenant();
	const deleteTenant = useDeleteTenant();
	const [formOpen, setFormOpen] = useState(false);
	const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
	const [formSeed, setFormSeed] = useState(0);

	const activeCount = useMemo(
		() => tenants.filter((tenant) => tenant.status !== 'inactive').length,
		[tenants],
	);

	const handleOpenCreate = () => {
		setEditingTenant(null);
		setFormSeed((current) => current + 1);
		setFormOpen(true);
	};

	const handleOpenEdit = (tenant: Tenant) => {
		setEditingTenant(tenant);
		setFormSeed((current) => current + 1);
		setFormOpen(true);
	};

	const handleDelete = async (tenant: Tenant) => {
		const confirmed = window.confirm(
			`¿Eliminar el tenant "${tenant.name}"? Esta acción no se puede deshacer.`,
		);
		if (!confirmed) return;

		try {
			await deleteTenant.mutateAsync(tenant.id);
		} catch (error) {
			console.error('Error deleting tenant:', error);
		}
	};

	const handleSubmit = async (payload: CreateTenantDto | UpdateTenantDto) => {
		try {
			if (editingTenant) {
				await updateTenant.mutateAsync({
					id: editingTenant.id,
					body: payload as UpdateTenantDto,
				});
				setEditingTenant(null);
				return;
			}

			await createTenant.mutateAsync(payload as CreateTenantDto);
		} catch (error) {
			console.error('Error saving tenant:', error);
		}
	};

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
						<p className="text-2xl font-bold text-muted-foreground">
							{tenants.length - activeCount}
						</p>
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
						onDelete={handleDelete}
					/>
				</CardContent>
			</Card>

			<TenantForm
				key={`${editingTenant?.id ?? 'create'}-${formSeed}`}
				open={formOpen}
				onOpenChange={(open) => {
					setFormOpen(open);
					if (!open) setEditingTenant(null);
				}}
				initialTenant={editingTenant}
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
