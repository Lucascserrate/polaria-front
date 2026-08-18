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
		<div className="flex flex-col gap-6 md:h-full md:min-h-0">
			{/* Header */}
			<div className="flex items-center justify-between shrink-0">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">Panel</h1>
					<p className="text-muted-foreground mt-1">
						Gestiona las citas y horarios de tu barbería
					</p>
				</div>
			</div>

			<div className="flex flex-col gap-6 lg:flex-row lg:flex-1 lg:min-h-0">
				<section className="bg-card border border-border rounded-lg flex flex-col lg:flex-1 lg:min-h-0">
					<div className="flex items-center justify-between p-6 pb-4 shrink-0">
						<h2 className="text-xl font-semibold">Agenda de hoy</h2>
						<AppointmentModal />
					</div>

					{statusError && (
						<p className="text-sm text-red-600 px-6 pb-4 shrink-0">
							No se pudo actualizar la cita. Intenta de nuevo.
						</p>
					)}

					<div className="flex-1 overflow-y-auto px-6 pb-6 lg:min-h-0">
						<AppointmentTimeline
							appointments={appointments}
							onMarkAttended={handleMarkAttended}
							onCancel={handleCancel}
							updatingId={updatingId}
						/>
					</div>
				</section>

				<aside className="flex flex-col gap-4 shrink-0 lg:w-80 lg:overflow-y-auto lg:min-h-0">
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
				</aside>
			</div>
		</div>
	);
};

export default DashboardPage;
