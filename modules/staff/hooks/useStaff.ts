'use client';

import { useEffect, useState } from 'react';
import type { AxiosError } from 'axios';
import { staffService } from '@/services/staff.service';
import type {
	CreateStaffDto,
	StaffMember,
	UpdateStaffDto,
} from '@/types/staff.types';

export function useStaff() {
	const [staff, setStaff] = useState<StaffMember[]>([]);
	const [loading, setLoading] = useState(true);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		const loadStaff = async () => {
			try {
				setLoading(true);
				const data = await staffService.getAll();
				if (active) {
					setStaff(data);
				}
			} catch (error) {
				console.error('Error loading staff:', error);
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		loadStaff();

		return () => {
			active = false;
		};
	}, []);

	const toggleActive = async (id: string) => {
		try {
			const currentStaff = staff.find((s) => s.id === id);
			if (!currentStaff) return;
			const updatedStaff = await staffService.update(id, {
				isActive: !currentStaff.isActive,
			});
			setStaff((current) => current.map((s) => (s.id === id ? updatedStaff : s)));
		} catch (error) {
			console.error('Error toggling staff active status:', error);
		}
	};

	const createStaff = async (data: CreateStaffDto) => {
		try {
			const created = await staffService.create(data);
			setStaff((current) => [...current, created]);
		} catch (error) {
			console.error('Error saving staff:', error);
		}
	};

	const updateStaff = async (id: string, data: UpdateStaffDto) => {
		try {
			const updated = await staffService.update(id, data);
			setStaff((current) => current.map((s) => (s.id === id ? updated : s)));
		} catch (error) {
			console.error('Error saving staff:', error);
		}
	};

	const deleteStaff = async (id: string) => {
		try {
			await staffService.delete(id);
			setStaff((current) => current.filter((s) => s.id !== id));
			setDeleteError(null);
			return true;
		} catch (error) {
			const axiosError = error as AxiosError<{ message?: string }>;
			if (axiosError.response?.status === 409) {
				setDeleteError(
					typeof axiosError.response.data?.message === 'string'
						? axiosError.response.data.message
						: 'Este miembro del staff no puede eliminarse porque tiene citas futuras programadas.',
				);
				return false;
			}

			console.error('Error deleting staff:', error);
			setDeleteError(
				'No se pudo eliminar el staff. Intenta de nuevo en unos momentos.',
			);
			return false;
		}
	};

	return {
		staff,
		loading,
		deleteError,
		setDeleteError,
		toggleActive,
		createStaff,
		updateStaff,
		deleteStaff,
	};
}
