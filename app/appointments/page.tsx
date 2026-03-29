'use client';

import { useState } from 'react';
import { MOCK_APPOINTMENTS } from '@/lib/mocks';
import AppointmentsTable from '@/modules/appointments/AppointmentTable';
import AppointmentModal from '@/modules/dashboard/AppointmentModal';
import { AppointmentStatus } from '@/types/appointments.types';

const AppointmentsPage = () => {
	const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);

	const handleDelete = (id: string) => {
		setAppointments(appointments.filter((a) => a.id !== id));
	};

	const handleStatusChange = (id: string, status: AppointmentStatus) => {
		setAppointments(
			appointments?.map((a) => (a.id === id ? { ...a, status } : a)),
		);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Todas las Citas</h1>
					<p className="text-muted-foreground mt-1">
						Visualiza y gestiona todas tus citas programadas
					</p>
				</div>
				<AppointmentModal
					onAddAppointment={(apt) => setAppointments([...appointments, apt])}
				/>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Total de Citas</p>
					<p className="text-2xl font-bold mt-1">{appointments.length}</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Confirmadas</p>
					<p className="text-2xl font-bold mt-1 text-blue-600">
						{appointments.filter((a) => a.status === 'confirmed').length}
					</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Completadas</p>
					<p className="text-2xl font-bold mt-1 text-green-600">
						{appointments.filter((a) => a.status === 'completed').length}
					</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Canceladas</p>
					<p className="text-2xl font-bold mt-1 text-red-600">
						{appointments.filter((a) => a.status === 'cancelled').length}
					</p>
				</div>
			</div>

			{/* Table */}
			<div className="bg-card border border-border rounded-lg p-6">
				<AppointmentsTable
					appointments={appointments}
					onDelete={handleDelete}
					onStatusChange={handleStatusChange}
				/>
			</div>
		</div>
	);
};

export default AppointmentsPage;
