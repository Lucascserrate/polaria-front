'use client';

import { useState, useEffect } from 'react';
import { StaffForm } from '@/modules/staff/StaffForm';
import StaffTable from '@/modules/staff/StaffTable';
import { staffService } from '@/services/staff.service';
import type { StaffMember } from '@/types/staff.types';

export default function StaffPage() {
	const [staff, setStaff] = useState<StaffMember[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadStaff();
	}, []);

	const loadStaff = async () => {
		try {
			setLoading(true);
			const data = await staffService.getAll();
			setStaff(data);
		} catch (error) {
			console.error('Error loading staff:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleToggleActive = async (id: string) => {
		try {
			const currentStaff = staff.find(s => s.id === id);
			if (currentStaff) {
				const updatedStaff = await staffService.update(id, { isActive: !currentStaff.isActive });
				setStaff(staff.map((s) => (s.id === id ? updatedStaff : s)));
			}
		} catch (error) {
			console.error('Error toggling staff active status:', error);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await staffService.delete(id);
			setStaff(staff.filter((s) => s.id !== id));
		} catch (error) {
			console.error('Error deleting staff:', error);
		}
	};

	const handleAddStaff = async (name: string, email: string) => {
		try {
			const createdStaff = await staffService.create({
				name,
				email,
				isActive: true
			});
			const normalizedStaff = { ...createdStaff, isActive: createdStaff?.isActive ?? createdStaff?.isActive };
			setStaff([...staff, normalizedStaff]);
		} catch (error) {
			console.error('Error adding staff:', error);
		}
	};

	const activeCount = staff.filter((s) => s.isActive).length;

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-lg">Cargando personal...</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">
						Gestión del personal
					</h1>
					<p className="text-muted-foreground mt-1">
						Administra el personal y los servicios de tu barbería
					</p>
				</div>
				<StaffForm onAddStaff={(staffData) => handleAddStaff(staffData.name, staffData.email)} />
			</div>

			{/* Stats */}
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

			{/* Table */}
			<div className="bg-card border border-border rounded-lg p-6">
				<StaffTable
					staff={staff}
					onToggleActive={handleToggleActive}
					onDelete={handleDelete}
					onAddClick={() => {}}
				/>
			</div>
		</div>
	);
}
