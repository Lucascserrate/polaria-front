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
import toAmPm from './utils/toAmPm';

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
						<div className="flex justify-end gap-2 pt-3 border-t border-border">
							<Button
								size="sm"
								variant="ghost"
								className="text-muted-foreground"
								disabled={isUpdating}
								onClick={() => setConfirmingCancel(true)}
							>
								<X className="w-4 h-4 mr-1" />
								Cancelar
							</Button>
							<Button
								size="sm"
								disabled={isUpdating}
								onClick={() => onMarkAttended(id)}
							>
								<Check className="w-4 h-4 mr-1" />
								Atendida
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
