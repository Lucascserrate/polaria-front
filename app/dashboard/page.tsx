'use client';

import { useEffect, useMemo, useState } from 'react';
import AppointmentTimeline from '@/modules/dashboard/AppointmentTimeline';
import AppointmentModal from '@/modules/dashboard/AppointmentModal';
import { SummaryCard } from '@/modules/dashboard/SummaryCard';
import type { Appointment, AppointmentApi } from '@/types/appointments.types';
import { getTodayAppointments } from '@/services/appointments';
import { getStaff } from '@/services/staff';

const mapAppointment = (apt: AppointmentApi): Appointment => {
	const startTime = new Date(apt.startTime);
	const endTime = new Date(apt.endTime);
	const durationMinutes = Number.isFinite(apt.totalDuration)
		? Number(apt.totalDuration)
		: Math.max(
				0,
				Math.round((endTime.getTime() - startTime.getTime()) / 60000),
			);

	return {
		id: apt.id,
		clientName: apt.clientName ?? 'Sin cliente',
		time: startTime,
		service: (apt.serviceNames ?? []).join(', ') || 'Sin servicio',
		barber: apt.staffName ?? 'Sin barbero',
		status: apt.status,
		duration: durationMinutes,
	};
};

const DashboardPage = () => {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [totalToday, setTotalToday] = useState(0);
	const [revenueToday, setRevenueToday] = useState(0);
	const [activeStaffCount, setActiveStaffCount] = useState(0);
	const [counts, setCounts] = useState({
		pending: 0,
		booked: 0,
		confirmed: 0,
		completed: 0,
		cancelled: 0,
	});

	useEffect(() => {
		const loadToday = async () => {
			try {
				const data = await getTodayAppointments();
				setAppointments(data.items.map(mapAppointment));
				setTotalToday(data.total ?? 0);
				setRevenueToday(data.revenueTotal ?? 0);
				setCounts(
					data.counts ?? {
						pending: 0,
						booked: 0,
						confirmed: 0,
						completed: 0,
						cancelled: 0,
					},
				);
			} catch (error) {
				console.error('Error loading today appointments:', error);
			}
		};

		loadToday();
	}, []);

	useEffect(() => {
		const loadStaff = async () => {
			try {
				const data = await getStaff();
				setActiveStaffCount(data.filter((s) => s.isActive).length);
			} catch (error) {
				console.error('Error loading staff:', error);
			}
		};

		loadStaff();
	}, []);

	const todayAppointments = useMemo(() => appointments, [appointments]);
	const confirmedCount = counts.confirmed;
	const completedCount = counts.completed;

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
						onAddAppointment={(apt) => setAppointments([...appointments, apt])}
					/>
				</div>

				<AppointmentTimeline appointments={todayAppointments} />
			</div>
		</div>
	);
};

export default DashboardPage;
