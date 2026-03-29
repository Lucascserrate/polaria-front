'use client';

import { useState, useMemo } from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Appointment, AppointmentStatus } from '@/types/appointments.types';
import DesktopTable from './DesktopTable';
import MobileCards from './MobileCards';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';

interface Props {
	appointments: Appointment[];
	onDelete: (id: string) => void;
	onStatusChange: (id: string, status: AppointmentStatus) => void;
}

const AppointmentsTable: React.FC<Props> = ({
	appointments,
	// onDelete,
	onStatusChange,
}) => {
	const [filterStatus, setFilterStatus] = useState<string>('all');
	const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc'>('date-asc');
	const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);

	const filtered = useMemo(() => {
		let result = appointments;
		if (filterStatus !== 'all') {
			result = result.filter((a) => a.status === filterStatus);
		}

		// Sort
		result.sort((a, b) => {
			if (sortBy === 'date-asc') {
				return a.time.getTime() - b.time.getTime();
			} else {
				return b.time.getTime() - a.time.getTime();
			}
		});

		return result;
	}, [appointments, filterStatus, sortBy]);

	if (filtered.length === 0) {
		return (
			<div className="text-center py-12">
				<p className="text-muted-foreground">No se encontraron citas</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Filters */}
			<div className="flex flex-col md:flex-row gap-4">
				<div className="flex-1">
					<label className="text-sm font-medium text-muted-foreground">
						Filtrar por Estado
					</label>
					<Select value={filterStatus} onValueChange={setFilterStatus}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Todos los Estados</SelectItem>
							<SelectItem value="confirmed">Confirmada</SelectItem>
							<SelectItem value="completed">Completada</SelectItem>
							<SelectItem value="cancelled">Cancelada</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="flex-1">
					<label className="text-sm font-medium text-muted-foreground">
						Ordenar por Fecha
					</label>
					<Select
						value={sortBy}
						onValueChange={(v: 'date-asc' | 'date-desc') => setSortBy(v)}
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

			<DesktopTable
				filtered={filtered}
				setDeleteDialogOpen={setDeleteDialogOpen}
				onStatusChange={onStatusChange}
			/>

			<MobileCards
				filtered={filtered}
				setDeleteDialogOpen={setDeleteDialogOpen}
				onStatusChange={onStatusChange}
			/>

			<DeleteConfirmationDialog
				open={deleteDialogOpen}
				setOpen={setDeleteDialogOpen}
			/>
		</div>
	);
};

export default AppointmentsTable;
