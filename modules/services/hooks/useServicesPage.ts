'use client';

import { useMemo, useState } from 'react';
import useCreateService from '@/services/services/useCreateService';
import useDeleteService from '@/services/services/useDeleteService';
import useGetServices from '@/services/services/useGetServices';
import useUpdateService from '@/services/services/useUpdateService';
import type { Service } from '@/types/services.types';

type ServiceFormPayload = {
	name: string;
	durationMinutes: number;
	price: number;
	description?: string;
};

const useServicesPage = () => {
	const { data: services = [], isPending, isError, error } = useGetServices();
	const createServiceMutation = useCreateService();
	const updateServiceMutation = useUpdateService();
	const deleteServiceMutation = useDeleteService();
	const [addOpen, setAddOpen] = useState(false);
	const [editingService, setEditingService] = useState<Service | null>(null);
	const [editOpen, setEditOpen] = useState(false);

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
			averagePrice:
				totals.priceCount > 0 ? totals.totalPrice / totals.priceCount : 0,
		};
	}, [services]);

	const handleDelete = (id: string) => {
		deleteServiceMutation.mutate(id);
	};

	const handleAddService = (newService: ServiceFormPayload) => {
		createServiceMutation.mutate({
			name: newService.name,
			description: newService.description,
			durationMinutes: newService.durationMinutes,
			price: newService.price,
			timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
			isActive: true,
		});
	};

	const handleEdit = (service: Service) => {
		setEditingService(service);
		setEditOpen(true);
	};

	const handleUpdateService = (updated: ServiceFormPayload) => {
		if (!editingService) return;

		updateServiceMutation.mutate(
			{
				id: editingService.id,
				data: {
					name: updated.name,
					description: updated.description,
					durationMinutes: updated.durationMinutes,
					price: updated.price,
				},
			},
			{
				onSuccess: () => {
					setEditOpen(false);
					setEditingService(null);
				},
			},
		);
	};

	const handleEditOpenChange = (open: boolean) => {
		setEditOpen(open);
		if (!open) setEditingService(null);
	};

	return {
		services,
		isPending,
		isError,
		error,
		stats,
		addOpen,
		setAddOpen,
		editOpen,
		setEditOpen,
		editingService,
		setEditingService,
		handleEditOpenChange,
		handleDelete,
		handleAddService,
		handleEdit,
		handleUpdateService,
		createServiceMutation,
		updateServiceMutation,
		deleteServiceMutation,
	};
};

export default useServicesPage;
