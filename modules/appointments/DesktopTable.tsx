import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { STATUS_COLORS } from '@/lib/mocks';
import { formatDateTime } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/types/appointments.types';

interface Props {
	filtered: Appointment[];
	onDelete: (id: string) => void;
	onStatusChange: (id: string, status: AppointmentStatus) => void;
}

const DesktopTable: React.FC<Props> = ({
	filtered,
	onStatusChange,
	onDelete,
}) => {
	return (
		<div className="hidden md:block border border-border rounded-lg overflow-hidden">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>Cliente</TableHead>
						<TableHead>Fecha y Hora</TableHead>
						<TableHead>Servicio</TableHead>
						<TableHead>Barbero</TableHead>
						<TableHead>Duración</TableHead>
						<TableHead>Estado</TableHead>
						<TableHead className="text-right">Acciones</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{filtered.map((apt) => {
						const colors = STATUS_COLORS[apt.status];
						return (
							<TableRow key={apt.id}>
								<TableCell className="font-medium">{apt.clientName}</TableCell>
								<TableCell>{formatDateTime(apt.time)}</TableCell>
								<TableCell>{apt.service}</TableCell>
								<TableCell>{apt.barber}</TableCell>
								<TableCell>{apt.duration}min</TableCell>
								<TableCell>
									<Badge className={colors.badge}>{apt.status}</Badge>
								</TableCell>
								<TableCell className="text-right space-x-2">
									<Select
										value={apt.status}
										onValueChange={(newStatus: AppointmentStatus) =>
											onStatusChange(apt.id, newStatus)
										}
									>
										<SelectTrigger className="w-32">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="confirmed">Confirmada</SelectItem>
											<SelectItem value="completed">Completada</SelectItem>
											<SelectItem value="cancelled">Cancelada</SelectItem>
										</SelectContent>
									</Select>
									<Button
										variant="ghost"
										size="sm"
										onClick={() => onDelete(apt.id)}
									>
										<Trash2 className="w-4 h-4 text-destructive" />
									</Button>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</div>
	);
};

export default DesktopTable;
