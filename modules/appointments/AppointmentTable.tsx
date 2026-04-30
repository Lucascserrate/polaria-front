'use client';

import { useEffect, useRef, useState } from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Appointment, AppointmentStatus } from '@/types/appointments.types';
import DesktopTable from './DesktopTable';
import MobileCards from './MobileCards';
import { useInView } from 'react-intersection-observer';

interface Props {
	appointments: Appointment[];
	onStatusChange: (id: string, status: AppointmentStatus) => void;
	hasMore: boolean;
	isFetchingNextPage: boolean;
	onLoadMore: () => void;
	onFiltersChange: (filters: {
		search?: string;
		status?: string;
		sortBy?: 'date-asc' | 'date-desc';
	}) => void;
	filters: {
		search?: string;
		status?: string;
		sortBy?: 'date-asc' | 'date-desc';
	};
}

const AppointmentsTable: React.FC<Props> = ({
	appointments,
	onStatusChange,
	hasMore,
	isFetchingNextPage,
	onLoadMore,
	onFiltersChange,
	filters,
}) => {
	const [localSearch, setLocalSearch] = useState(filters.search || '');
	const { ref, inView } = useInView({ threshold: 0.2 });

	const isRequestingRef = useRef(false);

	useEffect(() => {
		if (!inView || !hasMore || isFetchingNextPage) return;
		if (isRequestingRef.current) return;

		isRequestingRef.current = true;

		onLoadMore();
	}, [inView, hasMore, isFetchingNextPage, onLoadMore]);

	useEffect(() => {
		const timeout = setTimeout(() => {
			if (localSearch !== filters.search) {
				onFiltersChange({ ...filters, search: localSearch });
			}
		});

		return () => clearTimeout(timeout);
	}, [localSearch, filters.search]);

	const handleStatusChange = (status: string) => {
		onFiltersChange({ ...filters, status });
	};

	const handleSortChange = (sortBy: 'date-asc' | 'date-desc') => {
		onFiltersChange({ ...filters, sortBy });
	};

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex flex-col md:flex-row gap-4">
				<div className="flex-1">
					<label className="text-sm font-medium text-muted-foreground">
						Buscar por nombre, barbero o servicio
					</label>
					<Input
						placeholder="Buscar..."
						value={localSearch}
						onChange={(e) => setLocalSearch(e.target.value)}
					/>
				</div>
				<div className="flex-1">
					<label className="text-sm font-medium text-muted-foreground">
						Filtrar por Estado
					</label>
					<Select
						value={filters.status || 'all'}
						onValueChange={handleStatusChange}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todos los Estados</SelectItem>
							<SelectItem value="confirmed">Confirmada</SelectItem>
							<SelectItem value="completed">Completada</SelectItem>
							<SelectItem value="cancelled">Cancelada</SelectItem>
							<SelectItem value="pending">Pendiente</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="flex-1">
					<label className="text-sm font-medium text-muted-foreground">
						Ordenar por Fecha
					</label>
					<Select
						value={filters.sortBy || 'date-asc'}
						onValueChange={(v: 'date-asc' | 'date-desc') => handleSortChange(v)}
					>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="date-asc">Más Antiguas Primero</SelectItem>
							<SelectItem value="date-desc">Más Recientes Primero</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className="max-h-[60vh] overflow-y-auto">
				{appointments.length === 0 ? (
					<div className="text-center py-12">
						<p className="text-muted-foreground">No se encontraron citas</p>
					</div>
				) : (
					<>
						<DesktopTable
							filtered={appointments}
							onStatusChange={onStatusChange}
							hasMore={hasMore}
							isFetchingNextPage={isFetchingNextPage}
							loadMoreRef={ref}
						/>
						<MobileCards
							filtered={appointments}
							onStatusChange={onStatusChange}
						/>
					</>
				)}
			</div>
		</div>
	);
};

export default AppointmentsTable;
