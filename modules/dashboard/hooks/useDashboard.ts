'use client';

import { useCallback, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Appointment, AppointmentApi } from '@/types/appointments.types';
import { getTodayAppointments } from '@/services/appointments';
import { getStaff } from '@/services/staff';
import { getSortKeyFromFormatted } from '@/modules/appointments/utils/time';

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

export function useDashboard() {
	const queryClient = useQueryClient();

	const todayQuery = useQuery({
		queryKey: ['dashboard', 'today-appointments'],
		queryFn: getTodayAppointments,
		select: (data) => ({
			...data,
			items: data.items.map(mapAppointment),
		}),
	});

	const staffQuery = useQuery({
		queryKey: ['dashboard', 'staff'],
		queryFn: getStaff,
	});

	const todayAppointments = useMemo(
		() => todayQuery.data?.items ?? [],
		[todayQuery.data?.items],
	);

	const totalToday = todayQuery.data?.total ?? 0;
	const revenueToday = todayQuery.data?.revenueTotal ?? 0;

	const counts = useMemo(() => {
		return (
			todayQuery.data?.counts ?? {
				pending: 0,
				booked: 0,
				confirmed: 0,
				completed: 0,
				cancelled: 0,
			}
		);
	}, [todayQuery.data?.counts]);

	const activeStaffCount = useMemo(
		() => (staffQuery.data ?? []).filter((s) => s.isActive).length,
		[staffQuery.data],
	);

	const confirmedCount = counts.confirmed;
	const completedCount = counts.completed;

	const addAppointment = useCallback(
		(apt: Appointment) => {
			queryClient.setQueryData(
				['dashboard', 'today-appointments'],
				(
					prev:
						| undefined
						| {
								items: Appointment[];
								total: number;
								counts: typeof counts;
								revenueTotal: number;
						  },
				) => {
					if (!prev) {
						return {
							items: [apt],
							total: 1,
							counts,
							revenueTotal: 0,
						};
					}
					return {
						...prev,
						items: [...(prev.items ?? []), apt],
						total: (prev.total ?? 0) + 1,
					};
				},
			);
		},
		[counts, queryClient],
	);

	return {
		todayAppointments,
		totalToday,
		revenueToday,
		activeStaffCount,
		confirmedCount,
		completedCount,
		addAppointment,
		reload: todayQuery.refetch,
	};
}
