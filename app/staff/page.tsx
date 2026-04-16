'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { StaffForm } from '@/modules/staff/StaffForm';
import StaffTable from '@/modules/staff/StaffTable';
import { servicesService } from '@/services/services.service';
import { staffService } from '@/services/staff.service';
import type { StaffMember } from '@/types/staff.types';
import type { ServiceSummary } from '@/types/service.types';

export default function StaffPage() {
	const [staff, setStaff] = useState<StaffMember[]>([]);
	const [services, setServices] = useState<ServiceSummary[]>([]);
	const [loading, setLoading] = useState(true);

	const [formOpen, setFormOpen] = useState(false);
	const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

	useEffect(() => {
		void loadAll();
	}, []);

	const loadAll = async () => {
		try {
			setLoading(true);
			const [staffData, servicesData] = await Promise.all([
				staffService.getAll(),
				servicesService.getAll(),
			]);
			setStaff(staffData);
			setServices(
				servicesData.map((s) => ({
					id: s.id,
					name: s.name,
					isActive: s.isActive ?? true,
				})),
			);
		} catch (error) {
			console.error('Error loading staff/services:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleToggleActive = async (id: string) => {
		try {
			const currentStaff = staff.find((s) => s.id === id);
			if (!currentStaff) return;
			const updatedStaff = await staffService.update(id, {
				isActive: !currentStaff.isActive,
			});
			setStaff(staff.map((s) => (s.id === id ? updatedStaff : s)));
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

	const handleUpsert = async (data: {
		name: string;
		email: string;
		serviceIds?: string[];
	}) => {
		try {
			if (editingStaff) {
				const updated = await staffService.update(editingStaff.id, data);
				setStaff(staff.map((s) => (s.id === editingStaff.id ? updated : s)));
				return;
			}

			const created = await staffService.create({ ...data, isActive: true });
			setStaff([...staff, created]);
		} catch (error) {
			console.error('Error saving staff:', error);
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
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Gestión del personal</h1>
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
					<p className="text-2xl font-bold mt-1 text-green-600">{activeCount}</p>
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
					onAddClick={() => {}}
				/>
			</div>

			<StaffForm
				key={editingStaff?.id ?? 'create'}
				open={formOpen}
				onOpenChange={(next) => {
					setFormOpen(next);
					if (!next) setEditingStaff(null);
				}}
				services={services}
				initialStaff={editingStaff}
				onSubmit={(payload) =>
					handleUpsert({
						name: payload.name ?? '',
						email: payload.email ?? '',
						serviceIds: payload.serviceIds,
					})
				}
			/>
		</div>
	);
}
