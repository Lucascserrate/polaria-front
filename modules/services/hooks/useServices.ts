'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { servicesService } from '@/services/services/services.service';
import type { Service } from '@/types/services.types';

type UpsertPayload = {
	name: string;
	durationMinutes: number;
	price: number;
	description?: string;
};

export function useServices() {
	const [services, setServices] = useState<Service[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<unknown>(null);

	const [addOpen, setAddOpen] = useState(false);
	const [editingService, setEditingService] = useState<Service | null>(null);
	const [editOpen, setEditOpen] = useState(false);

	const loadServices = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await servicesService.getAll();
			setServices(data);
		} catch (err) {
			setError(err);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadServices();
	}, [loadServices]);

	const openCreate = useCallback(() => setAddOpen(true), []);
	const closeCreate = useCallback(() => setAddOpen(false), []);

	const openEdit = useCallback((service: Service) => {
		setEditingService(service);
		setEditOpen(true);
	}, []);

	const closeEdit = useCallback(() => {
		setEditOpen(false);
		setEditingService(null);
	}, []);

	const createService = useCallback(
		async (payload: UpsertPayload) => {
			try {
				const createdService = await servicesService.create({
					name: payload.name,
					description: payload.description,
					durationMinutes: payload.durationMinutes,
					price: payload.price,
					timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
					isActive: true,
				});
				setServices([...services, createdService]);
			} catch (err) {
				setError(err);
			}
		},
		[services],
	);

	const updateService = useCallback(
		async (payload: UpsertPayload) => {
			if (!editingService) return;
			try {
				const saved = await servicesService.update(editingService.id, {
					name: payload.name,
					description: payload.description,
					durationMinutes: payload.durationMinutes,
					price: payload.price,
				});
				setServices(services.map((s) => (s.id === editingService.id ? saved : s)));
				closeEdit();
			} catch (err) {
				setError(err);
			}
		},
		[closeEdit, editingService, services],
	);

	const toggleActive = useCallback(
		async (id: string) => {
			const current = services.find((s) => s.id === id);
			if (!current) return;

			try {
				const saved = await servicesService.update(id, {
					isActive: !(current.isActive ?? true),
				});
				setServices(services.map((s) => (s.id === id ? saved : s)));
			} catch (err) {
				setError(err);
			}
		},
		[services],
	);

	const stats = useMemo(() => {
		const totals = services.reduce(
			(acc, service) => {
				const duration = Number(service.durationMinutes);
				const price = Number(service.price);

				if (Number.isFinite(duration)) {
					acc.totalDuration += duration;
					acc.durationCount += 1;
				}

				if (Number.isFinite(price)) {
					acc.totalPrice += price;
					acc.priceCount += 1;
				}

				return acc;
			},
			{
				totalDuration: 0,
				durationCount: 0,
				totalPrice: 0,
				priceCount: 0,
			},
		);

		return {
			averageDuration:
				totals.durationCount > 0
					? Math.round(totals.totalDuration / totals.durationCount)
					: 0,
			averagePrice: totals.priceCount > 0 ? totals.totalPrice / totals.priceCount : 0,
		};
	}, [services]);

	return {
		services,
		loading,
		error,
		loadServices,

		stats,

		addOpen,
		setAddOpen,
		openCreate,
		closeCreate,

		editOpen,
		editingService,
		openEdit,
		closeEdit,

		createService,
		updateService,
		toggleActive,
	};
}
