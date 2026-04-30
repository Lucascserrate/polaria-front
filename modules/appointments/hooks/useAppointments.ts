'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  Appointment,
  AppointmentApi,
  AppointmentStatus,
} from '@/types/appointments.types';
import { getAppointments, updateAppointmentStatus } from '@/services/appointments';
import { getSortKeyFromFormatted } from '@/modules/appointments/utils/time';

type Filters = {
  search?: string;
  status?: string;
  sortBy?: 'date-asc' | 'date-desc';
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

export function useAppointments() {
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
  const [filters, setFilters] = useState<Filters>({ search: '' });

  const hasLoaded = useRef(false);

  const loadAppointments = useCallback(
    async (pageNumber = 1, append = false, currentFilters: Filters = filters) => {
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
    },
    [appointments.length, filters],
  );

  useEffect(() => {
    if (!hasLoaded.current) {
      hasLoaded.current = true;
      void loadAppointments(1, false);
    }
  }, [loadAppointments]);

  const changeFilters = useCallback(
    (newFilters: Filters) => {
      setFilters(newFilters);
      setPage(1);
      void loadAppointments(1, false, newFilters);
    },
    [loadAppointments],
  );

  const changeStatus = useCallback(
    async (id: string, status: AppointmentStatus) => {
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
    },
    [appointments],
  );

  const stats = useMemo(() => {
    return {
      total: totalAppointments,
      confirmed: statusCounts?.confirmed ?? 0,
      completed: statusCounts?.completed ?? 0,
      cancelled: statusCounts?.cancelled ?? 0,
    };
  }, [statusCounts, totalAppointments]);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      void loadAppointments(page + 1, true);
    }
  }, [hasMore, loadAppointments, loadingMore, page]);

  return {
    appointments,
    loading,
    loadingMore,
    isRefetching,
    hasMore,
    page,
    totalAppointments,
    statusCounts,
    filters,

    stats,

    loadAppointments,
    loadMore,
    changeFilters,
    changeStatus,
  };
}
