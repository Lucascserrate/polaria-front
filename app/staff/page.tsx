'use client';

import { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { StaffForm } from '@/modules/staff/StaffForm';
import StaffTable from '@/modules/staff/StaffTable';
import DeleteStaffDialog from '@/modules/staff/DeleteStaffDialog';
import useGetStaff from '@/services/staff/useGetStaff';
import useCreateStaff from '@/services/staff/useCreateStaff';
import useUpdateStaff from '@/services/staff/useUpdateStaff';
import useDeleteStaff from '@/services/staff/useDeleteStaff';
import type { StaffFormPayload, StaffMember } from '@/types/staff.types';

export default function StaffPage() {
	const { data: staff = [], isLoading } = useGetStaff();
	const { mutateAsync: createStaff } = useCreateStaff();
	const { mutateAsync: updateStaff } = useUpdateStaff();
	const { mutateAsync: deleteStaff, isPending: deletePending } =
		useDeleteStaff();

	const [formOpen, setFormOpen] = useState(false);
	const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
	const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);
	/** Resultado de la última acción: tanto el aviso de baja como un error. */
	const [actionMessage, setActionMessage] = useState<string | null>(null);

	const handleToggleActive = async (id: string) => {
		const current = staff.find((member) => member.id === id);
		if (!current) return;

		await updateStaff({ id, data: { isActive: !current.isActive } });
	};

	const handleOpenCreate = () => {
		setEditingStaff(null);
		setFormOpen(true);
	};

	const handleOpenEdit = (member: StaffMember) => {
		setEditingStaff(member);
		setFormOpen(true);
	};

	const handleUpsert = async (data: StaffFormPayload) => {
		if (editingStaff) {
			await updateStaff({ id: editingStaff.id, data });
			return;
		}

		await createStaff({ ...data, isActive: true });
	};

	const handleDelete = async (member: StaffMember) => {
		setActionMessage(null);

		try {
			const { mode } = await deleteStaff(member.id);
			setDeletingStaff(null);
			setActionMessage(
				mode === 'SOFT'
					? `${member.name} se dio de baja. Su historial y sus comisiones quedan intactos.`
					: null,
			);
		} catch (error) {
			// El 409 llega con la cantidad de citas próximas: es la información que
			// le dice al negocio qué tiene que resolver antes.
			const message =
				axios.isAxiosError(error) &&
				typeof error.response?.data?.message === 'string'
					? error.response.data.message
					: 'No se pudo eliminar al profesional. Intenta de nuevo.';
			setActionMessage(message);
			setDeletingStaff(null);
		}
	};

	const activeCount = staff.filter((member) => member.isActive).length;

	if (isLoading) {
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

			<div className="space-y-4">
				{actionMessage && (
					<p className="rounded-md border border-border p-3 text-sm text-muted-foreground">
						{actionMessage}
					</p>
				)}

				<StaffTable
					staff={staff}
					onToggleActive={handleToggleActive}
					onEdit={handleOpenEdit}
					onDelete={setDeletingStaff}
					onAddClick={handleOpenCreate}
				/>
			</div>

			<DeleteStaffDialog
				staff={deletingStaff}
				pending={deletePending}
				onOpenChange={(open) => {
					if (!open) setDeletingStaff(null);
				}}
				onConfirm={(member) => void handleDelete(member)}
			/>

			<StaffForm
				open={formOpen}
				onOpenChange={setFormOpen}
				initialStaff={editingStaff}
				onSubmit={handleUpsert}
			/>
		</div>
	);
}
