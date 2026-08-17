'use client';

import { useCallback } from 'react';
import AppointmentTimeline from '@/modules/dashboard/AppointmentTimeline';
import AppointmentModal from '@/modules/dashboard/AppointmentModal';
import { SummaryCard } from '@/modules/dashboard/SummaryCard';
import useGetWorkingStaff from '@/services/staff/useGetWorkingStaff';
import { EMPTY_COUNTS } from '@/modules/staff/constants';
import useGetTodayAppointments from '@/services/appointments/useGetTodayAppointments';
import useUpdateAppointmentStatus from '@/services/appointments/useUpdateAppointmentStatus';

const DashboardPage = () => {
	const { data: today } = useGetTodayAppointments();
	const { data: workingStaff } = useGetWorkingStaff();

	const {
		mutate: statusMutation,
		isPending,
		variables,
		isError: statusError,
	} = useUpdateAppointmentStatus();

	const handleMarkAttended = useCallback(
		(id: string) => statusMutation({ id, status: 'completed' }),
		[statusMutation],
	);

	const handleCancel = useCallback(
		(id: string) => statusMutation({ id, status: 'cancelled' }),
		[statusMutation],
	);

	const appointments = today?.items ?? [];

	const counts = today?.counts ?? EMPTY_COUNTS;
	const totalToday = today?.total ?? 0;
	const revenueToday = today?.revenueTotal ?? 0;
	const workingStaffCount = workingStaff?.staff.length ?? 0;

	// La cita en curso sale de la mutación, así que no hace falta un estado aparte.
	const updatingId = isPending ? (variables?.id ?? null) : null;

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
					confirmed={counts.confirmed}
					completed={counts.completed}
				/>
				<div className="bg-card border border-border rounded-lg p-6">
					<div className="text-sm font-medium text-muted-foreground">
						Trabajando hoy
					</div>
					<div className="text-3xl font-bold mt-2">{workingStaffCount}</div>
					<p className="text-xs text-muted-foreground mt-2">
						Profesionales con jornada hoy
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
						Solo citas atendidas
					</p>
				</div>
			</div>

			{/* Appointments Section */}
			<div className="bg-card border border-border rounded-lg p-6">
				<div className="flex items-center justify-between mb-6">
					<h2 className="text-xl font-semibold">Agenda de hoy</h2>
					<AppointmentModal />
				</div>

				{statusError && (
					<p className="text-sm text-red-600 mb-4">
						No se pudo actualizar la cita. Intenta de nuevo.
					</p>
				)}

				<AppointmentTimeline
					appointments={appointments}
					onMarkAttended={handleMarkAttended}
					onCancel={handleCancel}
					updatingId={updatingId}
				/>
			</div>
		</div>
	);
};

export default DashboardPage;
