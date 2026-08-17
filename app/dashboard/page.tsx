'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AppointmentTimeline from '@/modules/dashboard/AppointmentTimeline';
import AppointmentModal from '@/modules/dashboard/AppointmentModal';
import { SummaryCard } from '@/modules/dashboard/SummaryCard';
import type {
	Appointment,
	AppointmentApi,
	AppointmentStatus,
} from '@/types/appointments.types';
import {
	getTodayAppointments,
	updateAppointmentStatus,
} from '@/services/appointments';
import { getWorkingStaff } from '@/services/staff';

const getSortKeyFromFormatted = (formatted?: string | null): number => {
	if (typeof formatted !== 'string' || !formatted.trim()) return 0;

	const parts = formatted.split(',').map((p) => p.trim());
	const time = parts.length >= 2 ? parts[1] : formatted.trim();
	const match = time.match(/^(\d{1,2}):(\d{2})$/);
	if (!match) return 0;
	const hours = Number(match[1]);
	const minutes = Number(match[2]);
	if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0;
	return hours * 60 + minutes;
};

const mapAppointment = (apt: AppointmentApi): Appointment => {
	const durationMinutes = Number.isFinite(apt.totalDuration)
		? Number(apt.totalDuration)
		: 0;

	return {
		id: apt.id,
		clientName: apt.clientName ?? 'Sin cliente',
		timeLabel: apt.startTimeFormatted ?? 'Sin hora',
		sortKey: getSortKeyFromFormatted(apt.startTimeFormatted),
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
	const [workingStaffCount, setWorkingStaffCount] = useState(0);
	const [counts, setCounts] = useState({
		pending: 0,
		booked: 0,
		confirmed: 0,
		completed: 0,
		cancelled: 0,
	});

	const [updatingId, setUpdatingId] = useState<string | null>(null);
	const [actionError, setActionError] = useState<string | null>(null);

	const loadToday = useCallback(async () => {
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
	}, []);

	useEffect(() => {
		loadToday();
	}, [loadToday]);

	/**
	 * Cambiar el estado obliga a recargar el día entero: los totales y los
	 * ingresos los calcula el backend, así que actualizar solo la tarjeta dejaría
	 * las tarjetas de resumen mostrando los números viejos.
	 */
	const changeStatus = useCallback(
		async (id: string, status: AppointmentStatus) => {
			setUpdatingId(id);
			setActionError(null);
			try {
				await updateAppointmentStatus(id, status);
				await loadToday();
			} catch (error) {
				console.error('Error updating appointment status:', error);
				setActionError('No se pudo actualizar la cita. Intenta de nuevo.');
			} finally {
				setUpdatingId(null);
			}
		},
		[loadToday],
	);

	const handleMarkAttended = useCallback(
		(id: string) => changeStatus(id, 'completed'),
		[changeStatus],
	);

	const handleCancel = useCallback(
		(id: string) => changeStatus(id, 'cancelled'),
		[changeStatus],
	);

	useEffect(() => {
		const loadWorkingStaff = async () => {
			try {
				const data = await getWorkingStaff();
				setWorkingStaffCount(data.staff.length);
			} catch (error) {
				console.error('Error loading working staff:', error);
			}
		};

		loadWorkingStaff();
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
					<AppointmentModal onCreated={loadToday} />
				</div>

				{actionError && (
					<p className="text-sm text-red-600 mb-4">{actionError}</p>
				)}

				<AppointmentTimeline
					appointments={todayAppointments}
					onMarkAttended={handleMarkAttended}
					onCancel={handleCancel}
					updatingId={updatingId}
				/>
			</div>
		</div>
	);
};

export default DashboardPage;
