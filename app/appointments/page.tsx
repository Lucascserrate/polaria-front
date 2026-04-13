'use client';

import { useEffect, useMemo, useState } from 'react';
import AppointmentsTable from '@/modules/appointments/AppointmentTable';
import type {
	Appointment,
	AppointmentApi,
	AppointmentStatus,
} from '@/types/appointments.types';
import {
	getAppointments,
	updateAppointmentStatus,
} from '@/services/appointments.service';

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

const AppointmentsPage = () => {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [totalAppointments, setTotalAppointments] = useState(0);
	const [statusCounts, setStatusCounts] = useState({
		booked: 0,
		confirmed: 0,
		completed: 0,
		cancelled: 0,
	});

	const loadAppointments = async (pageNumber = 1, append = false) => {
		try {
			if (append) {
				setLoadingMore(true);
			} else {
				setLoading(true);
			}
			const data = await getAppointments(pageNumber, 20);
			const mapped = data.items.map(mapAppointment);
			setAppointments((prev) => (append ? [...prev, ...mapped] : mapped));
			setHasMore(data.hasMore);
			setPage(data.page);
			setTotalAppointments(data.total ?? 0);
			if (data.counts) {
				setStatusCounts(data.counts);
			}
		} catch (error) {
			console.error('Error loading appointments:', error);
		} finally {
			setLoading(false);
			setLoadingMore(false);
		}
	};

	useEffect(() => {
		loadAppointments(1, false);
	}, []);

	// const handleDelete = async (id: string) => {
	// 	try {
	// 		const current = appointments.find((a) => a.id === id);
	// 		await deleteAppointment(id);
	// 		setAppointments(appointments.filter((a) => a.id !== id));
	// 		if (current) {
	// 			setTotalAppointments((prev) => Math.max(0, prev - 1));
	// 			setStatusCounts((prev) => ({
	// 				...prev,
	// 				[current.status]: Math.max(0, prev[current.status] - 1),
	// 			}));
	// 		}
	// 	} catch (error) {
	// 		console.error('Error deleting appointment:', error);
	// 	}
	// };

	const handleStatusChange = async (id: string, status: AppointmentStatus) => {
		try {
			const current = appointments.find((a) => a.id === id);
			const updated = await updateAppointmentStatus(id, status);
			const mapped = mapAppointment(updated);
			const merged = current
				? {
						...current,
						...mapped,
						clientName: updated.clientName ?? current.clientName,
						service: updated.serviceNames
							? updated.serviceNames.join(', ') || current.service
							: current.service,
						barber: updated.staffName ?? current.barber,
						time: updated.startTime ? new Date(updated.startTime) : current.time,
						duration: Number.isFinite(updated.totalDuration)
							? Number(updated.totalDuration)
							: current.duration,
					}
				: mapped;
			setAppointments(appointments.map((a) => (a.id === id ? merged : a)));
			if (current && current.status !== mapped.status) {
				setStatusCounts((prev) => ({
					...prev,
					[current.status]: Math.max(0, prev[current.status] - 1),
					[mapped.status]: prev[mapped.status] + 1,
				}));
			}
		} catch (error) {
			console.error('Error updating appointment:', error);
		}
	};

	const stats = useMemo(() => {
		return {
			total: totalAppointments,
			confirmed: statusCounts?.confirmed ?? 0,
			completed: statusCounts?.completed ?? 0,
			cancelled: statusCounts?.cancelled ?? 0,
		};
	}, [statusCounts, totalAppointments]);

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
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Total de Citas</p>
					<p className="text-2xl font-bold mt-1">{stats.total}</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Confirmadas</p>
					<p className="text-2xl font-bold mt-1 text-blue-600">
						{stats.confirmed}
					</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Completadas</p>
					<p className="text-2xl font-bold mt-1 text-green-600">
						{stats.completed}
					</p>
				</div>
				<div className="bg-card border border-border rounded-lg p-4">
					<p className="text-sm text-muted-foreground">Canceladas</p>
					<p className="text-2xl font-bold mt-1 text-red-600">
						{stats.cancelled}
					</p>
				</div>
			</div>

			{/* Table */}
			<div className="bg-card border border-border rounded-lg p-6 max-h-screen overflow-y-auto">
				{loading ? (
					<div className="text-center text-muted-foreground">
						Cargando citas...
					</div>
				) : (
					<AppointmentsTable
						appointments={appointments}
						onStatusChange={handleStatusChange}
						hasMore={hasMore}
						isFetchingNextPage={loadingMore}
						onLoadMore={() => {
							if (!loadingMore && hasMore) {
								loadAppointments(page + 1, true);
							}
						}}
					/>
				)}
			</div>
		</div>
	);
};

export default AppointmentsPage;
