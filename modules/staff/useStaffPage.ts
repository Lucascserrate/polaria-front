'use client';

import { useState } from 'react';
import axios from 'axios';
import type { StaffFormPayload, StaffMember } from '@/types/staff.types';
import useCreateStaff from '@/services/staff/useCreateStaff';
import useDeleteStaff from '@/services/staff/useDeleteStaff';
import useGetStaff from '@/services/staff/useGetStaff';
import useUpdateStaff from '@/services/staff/useUpdateStaff';

export function useStaffPage() {
	const [formOpen, setFormOpen] = useState(false);
	const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
	const { data: staff = [], isLoading: loading } = useGetStaff();
	const createStaff = useCreateStaff();
	const updateStaff = useUpdateStaff();
	const deleteStaff = useDeleteStaff();

	const [deletingStaff, setDeletingStaff] = useState<StaffMember | null>(null);
	/** Resultado de la última eliminación: tanto el aviso de baja como un error. */
	const [actionMessage, setActionMessage] = useState<string | null>(null);

	const handleToggleActive = async (id: string) => {
		try {
			const currentStaff = staff.find((s) => s.id === id);
			if (!currentStaff) return;
			await updateStaff.mutateAsync({
				id,
				data: {
					isActive: !currentStaff.isActive,
				},
			});
		} catch (error) {
			console.error('Error toggling staff active status:', error);
		}
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
		try {
			if (editingStaff) {
				await updateStaff.mutateAsync({
					id: editingStaff.id,
					data,
				});
				return;
			}

			await createStaff.mutateAsync({ ...data, isActive: true });
		} catch (error) {
			console.error('Error saving staff:', error);
		}
	};

	const handleFormOpenChange = (next: boolean) => {
		setFormOpen(next);
		if (!next) setEditingStaff(null);
	};

	const handleDelete = async (member: StaffMember) => {
		setActionMessage(null);

		try {
			const { mode } = await deleteStaff.mutateAsync(member.id);
			setDeletingStaff(null);
			// Solo se avisa la baja lógica: que se conserve el historial es lo que el
			// dueño no esperaría. Una eliminación definitiva se explica sola con la
			// fila que desaparece.
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

	const handleDeleteDialogChange = (next: boolean) => {
		if (!next) setDeletingStaff(null);
	};

	const activeCount = staff.filter((s) => s.isActive).length;

	return {
		staff,
		loading,
		formOpen,
		editingStaff,
		activeCount,
		deletingStaff,
		deletePending: deleteStaff.isPending,
		actionMessage,
		requestDelete: setDeletingStaff,
		handleDelete,
		handleDeleteDialogChange,
		handleToggleActive,
		handleOpenCreate,
		handleOpenEdit,
		handleUpsert,
		handleFormOpenChange,
	};
}

export default useStaffPage;
