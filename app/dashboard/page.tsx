'use client';

import { useState } from 'react';
import { MOCK_APPOINTMENTS } from '@/lib/mocks';
import { AppointmentTimeline } from '@/modules/dashboard/AppointmentTimeline';
import AppointmentModal from '@/modules/dashboard/AppointmentModal';
import { SummaryCard } from '@/modules/dashboard/SummaryCard';

export default function DashboardPage() {
	const [appointments, setAppointments] = useState(MOCK_APPOINTMENTS);

	// Get today's appointments
	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);

	const todayAppointments = appointments.filter((a) => {
		const apptDate = new Date(a.time);
		apptDate.setHours(0, 0, 0, 0);
		return apptDate.getTime() === today.getTime();
	});

	const confirmedCount = todayAppointments.filter(
		(a) => a.status === 'confirmed',
	).length;
	const completedCount = todayAppointments.filter(
		(a) => a.status === 'completed',
	).length;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Panel</h1>
					<p className="text-muted-foreground mt-1">
						Gestiona las citas y horarios de tu barbería
					</p>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<SummaryCard
					count={todayAppointments.length}
					confirmed={confirmedCount}
					completed={completedCount}
				/>
				<div className="bg-card border border-border rounded-lg p-6">
					<div className="text-sm font-medium text-muted-foreground">
						Staff activo
					</div>
					<div className="text-3xl font-bold mt-2">2</div>
					<p className="text-xs text-muted-foreground mt-2">
						Miembros del staff trabajando hoy
					</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-6">
					<div className="text-sm font-medium text-muted-foreground">
						Ingresos de hoy
					</div>
					<div className="text-3xl font-bold mt-2">BOB 450</div>
					<p className="text-xs text-muted-foreground mt-2">
						Estimado según las citas
					</p>
				</div>
			</div>

			{/* Appointments Section */}
			<div className="bg-card border border-border rounded-lg p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-semibold">Agenda de hoy</h2>
					<AppointmentModal
						onAddAppointment={(apt) => setAppointments([...appointments, apt])}
					/>
				</div>

				<AppointmentTimeline appointments={todayAppointments} />
			</div>
		</div>
	);
}
