'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { staffService } from '@/services/staff.service';
import type { StaffMember } from '@/types/staff.types';

type UpsertPayload = {
	name: string;
	serviceIds?: string[];
};

export function useStaff() {
	const [staff, setStaff] = useState<StaffMember[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<unknown>(null);

	const [formOpen, setFormOpen] = useState(false);
	const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

	const refresh = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await staffService.getAll();
			setStaff(data);
		} catch (err) {
			setError(err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void refresh();
	}, [refresh]);

	const openCreate = useCallback(() => {
		setEditingStaff(null);
		setFormOpen(true);
	}, []);

	const openEdit = useCallback((member: StaffMember) => {
		setEditingStaff(member);
		setFormOpen(true);
	}, []);

	const closeForm = useCallback(() => {
		setFormOpen(false);
		setEditingStaff(null);
	}, []);

	const toggleActive = useCallback(
		async (id: string) => {
			const currentStaff = staff.find((s) => s.id === id);
			if (!currentStaff) return;

			try {
				const updatedStaff = await staffService.update(id, {
					isActive: !currentStaff.isActive,
				});
				setStaff(staff.map((s) => (s.id === id ? updatedStaff : s)));
			} catch (err) {
				setError(err);
			}
		},
		[staff],
	);

	const upsert = useCallback(
		async (data: UpsertPayload) => {
			try {
				if (editingStaff) {
					const updated = await staffService.update(editingStaff.id, data);
					setStaff(
						staff.map((s) => (s.id === editingStaff.id ? updated : s)),
					);
					return;
				}

				const created = await staffService.create({ ...data, isActive: true });
				setStaff([...staff, created]);
			} catch (err) {
				setError(err);
			}
		},
		[editingStaff, staff],
	);

	const activeCount = useMemo(
		() => staff.filter((s) => s.isActive).length,
		[staff],
	);

	return {
		staff,
		loading,
		error,
		refresh,

		formOpen,
		setFormOpen,
		editingStaff,

		openCreate,
		openEdit,
		closeForm,
		toggleActive,
		upsert,

		activeCount,
	};
}

