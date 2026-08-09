'use client';

import { useState } from 'react';
import { Check, Clock, Scissors, User, Users, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
	getAppointmentStatusText,
	STATUS_COLORS,
} from '@/modules/appointments/utils/constants';
import { AppointmentStatus } from '@/types/appointments.types';

interface AppointmentCardProps {
	id: string;
	timeLabel: string;
	clientName: string;
	service: string;
	barber: string;
	status: AppointmentStatus;
	duration: number;
	onMarkAttended: (id: string) => void;
	onCancel: (id: string) => void;
	isUpdating?: boolean;
}

/**
 * Estados en los que la cita todavía espera una resolución. Solo ahí tiene
 * sentido ofrecer las acciones: una cita ya atendida o cancelada no se toca
 * desde acá, se corrige en la pantalla de citas.
 */
const OPEN_STATUSES: AppointmentStatus[] = ['pending', 'booked', 'confirmed'];

const toAmPm = (timeLabel?: string | null): string => {
	if (typeof timeLabel !== 'string' || !timeLabel.trim()) return 'Sin hora';

	const parts = timeLabel.split(',').map((p) => p.trim());
	const time24h = parts.length >= 2 ? parts[1] : timeLabel.trim();
	const match = time24h.match(/^(\d{1,2}):(\d{2})$/);
	if (!match) return time24h;
	const hours24 = Number(match[1]);
	const minutes = match[2];
	if (!Number.isFinite(hours24)) return time24h;
	const suffix = hours24 >= 12 ? 'PM' : 'AM';
	const hours12 = ((hours24 + 11) % 12) + 1;
	return `${String(hours12).padStart(2, '0')}:${minutes} ${suffix}`;
};

export function AppointmentCard({
	id,
	timeLabel,
	clientName,
	service,
	barber,
	status,
	duration,
	onMarkAttended,
	onCancel,
	isUpdating = false,
}: AppointmentCardProps) {
	const [confirmingCancel, setConfirmingCancel] = useState(false);

	const colors = STATUS_COLORS[status] ?? STATUS_COLORS.booked;
	const timeStr = toAmPm(timeLabel);
	const isOpen = OPEN_STATUSES.includes(status);

	return (
		<div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
			<div className="flex items-start justify-between gap-4">
				<div className="flex-1 space-y-3">
					{/* Time and Status */}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Clock className="w-4 h-4 text-muted-foreground" />
							<span className="text-sm font-semibold text-foreground">
								{timeStr}
							</span>
							<span className="text-xs text-muted-foreground">
								({duration}min)
							</span>
						</div>
						<Badge className={colors.badge}>
							{getAppointmentStatusText(status)}
						</Badge>
					</div>

					{/* Client Name */}
					<div className="flex items-center gap-2">
						<User className="w-4 h-4 text-muted-foreground" />
						<span className="text-sm font-medium text-foreground">
							{clientName}
						</span>
					</div>

					{/* Service */}
					<div className="flex items-center gap-2">
						<Scissors className="w-4 h-4 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">{service}</span>
					</div>

					{/* Barber */}
					<div className="flex items-center gap-2">
						<Users className="w-4 h-4 text-muted-foreground" />
						<span className="text-sm text-muted-foreground">{barber}</span>
					</div>

					{isOpen && (
						<div className="flex gap-2 pt-3 border-t border-border">
							{/* Marcar atendida es lo que convierte la cita en ingreso: los
							    reportes solo cuentan las completadas. */}
							<Button
								size="sm"
								className="flex-1"
								disabled={isUpdating}
								onClick={() => onMarkAttended(id)}
							>
								<Check className="w-4 h-4 mr-1" />
								Atendida
							</Button>
							<Button
								size="sm"
								variant="outline"
								disabled={isUpdating}
								onClick={() => setConfirmingCancel(true)}
							>
								<X className="w-4 h-4 mr-1" />
								Cancelar
							</Button>
						</div>
					)}
				</div>
			</div>

			<AlertDialog open={confirmingCancel} onOpenChange={setConfirmingCancel}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>¿Cancelar la cita?</AlertDialogTitle>
						<AlertDialogDescription>
							{`La cita de ${clientName} a las ${timeStr} deja de contar y su horario vuelve a ofrecerse.`}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<div className="flex gap-2 justify-end">
						<AlertDialogCancel>Volver</AlertDialogCancel>
						<AlertDialogAction
							onClick={() => onCancel(id)}
							className="bg-destructive hover:bg-destructive/90"
						>
							Cancelar cita
						</AlertDialogAction>
					</div>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
