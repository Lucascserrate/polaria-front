'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { StaffForm } from '@/modules/staff/StaffForm';
import StaffTable from '@/modules/staff/StaffTable';
import { useStaffPage } from '@/modules/staff/useStaffPage';

export default function StaffPage() {
	const {
		staff,
		loading,
		formOpen,
		editingStaff,
		activeCount,
		handleToggleActive,
		handleOpenCreate,
		handleOpenEdit,
		handleUpsert,
		handleFormOpenChange,
	} = useStaffPage();

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-lg">Cargando personal...</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Gestión del personal
					</h1>
					<p className="text-muted-foreground mt-1">
						Administra el personal y los servicios que puede realizar
					</p>
				</div>
				<Button onClick={handleOpenCreate} className="gap-2">
					<Plus className="w-4 h-4" />
					Agregar personal
				</Button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Personal total</p>
					<p className="text-2xl font-bold mt-1">{staff.length}</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Activo</p>
					<p className="text-2xl font-bold mt-1 text-green-600">
						{activeCount}
					</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Inactivo</p>
					<p className="text-2xl font-bold mt-1 text-muted-foreground">
						{staff.length - activeCount}
					</p>
				</div>
			</div>

			<div className="bg-card border border-border rounded-lg p-6">
				<StaffTable
					staff={staff}
					onToggleActive={handleToggleActive}
					onEdit={handleOpenEdit}
					onAddClick={handleOpenCreate}
				/>
			</div>

			<StaffForm
				key={editingStaff?.id ?? 'create'}
				open={formOpen}
				onOpenChange={handleFormOpenChange}
				initialStaff={editingStaff}
				onSubmit={handleUpsert}
			/>
		</div>
	);
}
