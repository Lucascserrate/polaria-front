'use client';

import { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import AppointmentsTable from '@/modules/appointments/AppointmentTable';
import type {
	Appointment,
	AppointmentApi,
	AppointmentStatus,
} from '@/types/appointments.types';
import {
	getAppointments,
	updateAppointmentStatus,
} from '@/services/appointments';

const getSortKeyFromFormatted = (formatted: string): number => {
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
		timeLabel: apt.startTimeFormatted,
		sortKey: getSortKeyFromFormatted(apt.startTimeFormatted),
		service: (apt.serviceNames ?? []).join(', ') || 'Sin servicio',
		barber: apt.staffName ?? 'Sin barbero',
		status: apt.status,
		duration: durationMinutes,
	};
};

const AppointmentsPage = () => {
	const [appointments, setAppointments] = useState<Appointment[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingMore, setLoadingMore] = useState(false);
	const [isRefetching, setIsRefetching] = useState(false);
	const [hasMore, setHasMore] = useState(true);
	const [page, setPage] = useState(1);
	const [totalAppointments, setTotalAppointments] = useState(0);
	const [statusCounts, setStatusCounts] = useState({
		pending: 0,
		booked: 0,
		confirmed: 0,
		completed: 0,
		cancelled: 0,
	});
	const [filters, setFilters] = useState<{
		search?: string;
		status?: string;
		sortBy?: 'date-asc' | 'date-desc';
	}>({ search: '' });

	const hasLoaded = useRef(false);

	const loadAppointments = useCallback(async (pageNumber = 1, append = false, currentFilters = filters) => {
		try {
			if (append) {
				setLoadingMore(true);
			} else {
				setLoading(true);
				if (appointments.length > 0) {
					setIsRefetching(true);
				}
			}
			const data = await getAppointments(pageNumber, 20, currentFilters);
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
			setIsRefetching(false);
		}
	}, [appointments.length, filters]);

	useEffect(() => {
		if (!hasLoaded.current) {
			hasLoaded.current = true;
			loadAppointments(1, false);
		}
	}, [loadAppointments]);

	const handleFiltersChange = useCallback((newFilters: typeof filters) => {
		setFilters(newFilters);
		setPage(1);
		loadAppointments(1, false, newFilters);
	}, [loadAppointments]);

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
						timeLabel: updated.startTimeFormatted
							? updated.startTimeFormatted
							: current.timeLabel,
						sortKey: updated.startTimeFormatted
							? getSortKeyFromFormatted(updated.startTimeFormatted)
							: current.sortKey,
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
			<div className="bg-card border border-border rounded-lg p-6 max-h-screen overflow-y-auto relative">
				{isRefetching && (
					<div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-md z-10">
						Actualizando...
					</div>
				)}
				
				{loading && appointments.length === 0 ? (
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
						onFiltersChange={handleFiltersChange}
						filters={filters}
					/>
				)}
			</div>
		</div>
	);
};

export default AppointmentsPage;
