import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from '@/modules/appointments/utils/constants';
import { Appointment, AppointmentStatus } from '@/types/appointments.types';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface Props {
	filtered: Appointment[];
	onStatusChange: (id: string, status: AppointmentStatus) => void;
}

const MobileCards: React.FC<Props> = ({ filtered, onStatusChange }) => {
	return (
		<div className="md:hidden space-y-3">
			{filtered.map((apt) => {
				const colors = STATUS_COLORS[apt.status] ?? STATUS_COLORS.booked;
				return (
					<div
						key={apt.id}
						className="bg-card border border-border rounded-lg p-4 space-y-3"
					>
						<div className="flex items-start justify-between">
							<div>
								<p className="font-medium">{apt.clientName}</p>
								<p className="text-sm text-muted-foreground">
									{apt.timeLabel}
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
							{/* <Button
								variant="ghost"
								size="sm"
								className="hidden w-full"
								onClick={() => {
									onDeleteRequest(apt.id);
									setDeleteDialogOpen(true);
								}}
							>
								<Trash2 className="w-4 h-4 mr-1 text-destructive" />
								Eliminar
							</Button> */}
						</div>
					</div>
				);
			})}
		</div>
	);
};

export default MobileCards;
