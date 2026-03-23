'use client';

import { useState, useMemo } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { STATUS_COLORS } from '@/lib/mocks';
import { formatDateTime } from '@/lib/date-utils';
import { Appointment, AppointmentStatus } from '@/types/appointments.types';
import DesktopTable from './DesktopTable';

interface Props {
	appointments: Appointment[];
	onDelete: (id: string) => void;
	onStatusChange: (id: string, status: AppointmentStatus) => void;
}

const AppointmentsTable: React.FC<Props> = ({
	appointments,
	onDelete,
	onStatusChange,
}) => {
	const [filterStatus, setFilterStatus] = useState<string>('all');
	const [sortBy, setSortBy] = useState<'date-asc' | 'date-desc'>('date-asc');

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
				onDelete={onDelete}
				onStatusChange={onStatusChange}
			/>

			{/* Mobile Cards */}
			<div className="md:hidden space-y-3">
				{filtered.map((apt) => {
					const colors = STATUS_COLORS[apt.status];
					return (
						<div
							key={apt.id}
							className="bg-card border border-border rounded-lg p-4 space-y-3"
						>
							<div className="flex items-start justify-between">
								<div>
									<p className="font-medium">{apt.clientName}</p>
									<p className="text-sm text-muted-foreground">
										{formatDateTime(apt.time)}
									</p>
								</div>
								<Badge className={colors.badge}>{apt.status}</Badge>
							</div>
							<div className="grid grid-cols-2 gap-2 text-sm">
								<div>
									<p className="text-muted-foreground">Servicio</p>
									<p className="font-medium">{apt.service}</p>
								</div>
								<div>
									<p className="text-muted-foreground">Barbero</p>
									<p className="font-medium">{apt.barber}</p>
								</div>
								<div>
									<p className="text-muted-foreground">Duración</p>
									<p className="font-medium">{apt.duration}min</p>
								</div>
							</div>
							<div className="flex flex-col gap-2 pt-2 border-t border-border space-y-2">
								<div className="text-sm">
									<p className="text-muted-foreground mb-1">Cambiar Estado</p>
									<Select
										value={apt.status}
										onValueChange={(newStatus: AppointmentStatus) =>
											onStatusChange(apt.id, newStatus)
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="confirmed">Confirmada</SelectItem>
											<SelectItem value="completed">Completada</SelectItem>
											<SelectItem value="cancelled">Cancelada</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<Button
									variant="ghost"
									size="sm"
									className="w-full"
									onClick={() => onDelete(apt.id)}
								>
									<Trash2 className="w-4 h-4 mr-1 text-destructive" />
									Eliminar
								</Button>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default AppointmentsTable;
