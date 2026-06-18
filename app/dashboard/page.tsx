'use client';

import AppointmentTimeline from '@/modules/dashboard/AppointmentTimeline';
import AppointmentModal from '@/modules/dashboard/AppointmentModal';
import { SummaryCard } from '@/modules/dashboard/SummaryCard';
import { useDashboard } from '@/modules/dashboard/hooks/useDashboard';

const DashboardPage = () => {
	const {
		todayAppointments,
		totalToday,
		revenueToday,
		activeStaffCount,
		confirmedCount,
		completedCount,
		addAppointment,
	} = useDashboard();

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
					count={totalToday}
					confirmed={confirmedCount}
					completed={completedCount}
				/>
				<div className="bg-card border border-border rounded-lg p-6">
					<div className="text-sm font-medium text-muted-foreground">
						Staff activo
					</div>
					<div className="text-3xl font-bold mt-2">{activeStaffCount}</div>
					<p className="text-xs text-muted-foreground mt-2">
						Miembros del staff trabajando hoy
					</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-6">
					<div className="text-sm font-medium text-muted-foreground">
						Ingresos de hoy
					</div>
					<div className="text-3xl font-bold mt-2">
						BOB {Math.round(revenueToday)}
					</div>
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
						onAddAppointment={addAppointment}
					/>
				</div>

				<AppointmentTimeline appointments={todayAppointments} />
			</div>
		</div>
	);
};

export default DashboardPage;
