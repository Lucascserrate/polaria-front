'use client';

import { useState } from 'react';
import { MOCK_STAFF } from '@/lib/mocks';
import { StaffForm } from '@/modules/staff/StaffForm';
import StaffTable from '@/modules/staff/StaffTable';

interface StaffMember {
	id: string;
	name: string;
	active: boolean;
	services: string[];
}

export default function StaffPage() {
	const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);

	const handleToggleActive = (id: string) => {
		setStaff(staff.map((s) => (s.id === id ? { ...s, active: !s.active } : s)));
	};

	const handleDelete = (id: string) => {
		setStaff(staff.filter((s) => s.id !== id));
	};

	const handleAddStaff = (newMember: { name: string; services: string[] }) => {
		const member: StaffMember = {
			id: String(Math.max(...staff.map((s) => parseInt(s.id)), 0) + 1),
			name: newMember.name,
			active: true,
			services: newMember.services,
		};
		setStaff([...staff, member]);
	};

	const activeCount = staff.filter((s) => s.active).length;

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
				<StaffForm onAddStaff={handleAddStaff} />
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Personal total</p>
					<p className="text-2xl font-bold mt-1">{staff.length}</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Activo</p>
					<p className="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">
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
