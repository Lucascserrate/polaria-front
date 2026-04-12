'use client';

import { useEffect, useState } from 'react';
import { AppointmentTimeline } from '@/modules/dashboard/AppointmentTimeline';
import AppointmentModal from '@/modules/dashboard/AppointmentModal';
import { SummaryCard } from '@/modules/dashboard/SummaryCard';
import type { Appointment } from '@/interfaces/appointments.interfaces';
import { getTodayAppointments } from '@/services/appointments.service';

export default function DashboardPage() {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let active = true;

		const load = async () => {
			try {
				setLoading(true);
				const items = await getTodayAppointments();
				if (active) {
					setAppointments(items);
					setError(null);
				}
			} catch {
				if (active) {
					setAppointments([]);
					setError('No se pudieron cargar las citas');
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		};

		load();
		return () => {
			active = false;
		};
	}, []);

	// Get today's appointments
	const today = new Date();
	today.setHours(0, 0, 0, 0);

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

				{loading ? (
					<p className="text-muted-foreground">Cargando citas...</p>
				) : error ? (
					<p className="text-muted-foreground">{error}</p>
				) : (
					<AppointmentTimeline appointments={todayAppointments} />
				)}
			</div>
		</div>
	);
}
