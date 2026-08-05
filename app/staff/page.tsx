'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DeleteStaffDialog } from '@/modules/staff/DeleteStaffDialog';
import { StaffForm } from '@/modules/staff/StaffForm';
import { StaffStats } from '@/modules/staff/StaffStats';
import StaffTable from '@/modules/staff/StaffTable';
import type { StaffMember } from '@/types/staff.types';
import { useStaff } from '@/modules/staff/hooks/useStaff';

export default function StaffPage() {
	const {
		staff,
		loading,
		deleteError,
		setDeleteError,
		toggleActive,
		createStaff,
		updateStaff,
		deleteStaff,
	} = useStaff();
	const [formOpen, setFormOpen] = useState(false);
	const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);

	const handleOpenCreate = () => {
		setEditingStaff(null);
		setFormOpen(true);
	};

	const handleOpenEdit = (member: StaffMember) => {
		setEditingStaff(member);
		setFormOpen(true);
	};

	const handleOpenDelete = (member: StaffMember) => {
		setDeletingStaff(member);
		setDeleteError(null);
		setDeleteOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!deletingStaff) return;

		const deleted = await deleteStaff(deletingStaff.id);
		if (deleted) {
			setDeleteOpen(false);
			setDeletingStaff(null);
			setDeleteError(null);
		}
	};

	const handleUpsert = async (data: { name: string; serviceIds?: string[] }) => {
		if (editingStaff) {
			await updateStaff(editingStaff.id, data);
			return;
		}

		await createStaff({ ...data, isActive: true });
	};

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
						Gestion del personal
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
				<StaffStats staff={staff} />
			</div>

			<div className="bg-card border border-border rounded-lg p-6">
				<StaffTable
					staff={staff}
					onToggleActive={toggleActive}
					onEdit={handleOpenEdit}
					onDelete={handleOpenDelete}
					onAddClick={handleOpenCreate}
				/>
			</div>

			<StaffForm
				key={editingStaff?.id ?? 'create'}
				open={formOpen}
				onOpenChange={(next) => {
					setFormOpen(next);
					if (!next) setEditingStaff(null);
				}}
				initialStaff={editingStaff}
				onSubmit={(payload) =>
					handleUpsert({
						name: payload.name ?? '',
						serviceIds: payload.serviceIds,
					})
				}
			/>

			<DeleteStaffDialog
				open={deleteOpen}
				onOpenChange={(open) => {
					setDeleteOpen(open);
					if (!open) {
						setDeletingStaff(null);
						setDeleteError(null);
					}
				}}
				staff={deletingStaff}
				error={deleteError}
				onConfirm={handleConfirmDelete}
			/>
		</div>
	);
}