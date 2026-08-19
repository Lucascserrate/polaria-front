'use client';

import { useState } from 'react';
import type { StaffFormPayload, StaffMember } from '@/types/staff.types';
import useCreateStaff from '@/services/staff/useCreateStaff';
import useGetStaff from '@/services/staff/useGetStaff';
import useUpdateStaff from '@/services/staff/useUpdateStaff';

export function useStaffPage() {
	const [formOpen, setFormOpen] = useState(false);
	const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
	const { data: staff = [], isLoading: loading } = useGetStaff();
	const createStaff = useCreateStaff();
	const updateStaff = useUpdateStaff();

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

	const activeCount = staff.filter((s) => s.isActive).length;

	return {
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
	};
}

export default useStaffPage;
