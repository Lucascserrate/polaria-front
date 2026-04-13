import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { STATUS_COLORS } from './utils/constants';
import { formatDateTime } from '@/lib/date-utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SquarePen, Trash2 } from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/types/appointments.types';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';

interface Props {
	filtered: Appointment[];
	onStatusChange: (id: string, status: AppointmentStatus) => void;
	hasMore: boolean;
	isFetchingNextPage: boolean;
	loadMoreRef: (node?: Element | null | undefined) => void;
}

const DesktopTable: React.FC<Props> = ({
	filtered,
	onStatusChange,
	hasMore,
	isFetchingNextPage,
	loadMoreRef,
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
									<div className="flex items-center justify-end gap-1">
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="ghost"
													size="sm"
													title="Editar estado"
													className="p-0 h-auto w-auto hover:opacity-60"
												>
													<SquarePen className="w-4 h-4 text-neutral-900 dark:text-neutral-100" />
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-40 p-2" align="end">
												<div className="space-y-1">
													<Button
														variant="ghost"
														size="sm"
														className="w-full justify-start text-sm"
														onClick={() => onStatusChange(apt.id, 'confirmed')}
													>
														Confirmada
													</Button>
													<Button
														variant="ghost"
														size="sm"
														className="w-full justify-start text-sm"
														onClick={() => onStatusChange(apt.id, 'completed')}
													>
														Completada
													</Button>
													<Button
														variant="ghost"
														size="sm"
														className="w-full justify-start text-sm"
														onClick={() => onStatusChange(apt.id, 'cancelled')}
													>
														Cancelada
													</Button>
												</div>
											</PopoverContent>
										</Popover>
									</div>
								</TableCell>
							</TableRow>
						);
					})}
					{hasMore && (
						<TableRow ref={loadMoreRef}>
							<TableCell colSpan={7} className="text-center py-4">
								{isFetchingNextPage
									? 'Cargando más...'
									: 'Desliza para cargar más'}
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	);
};

export default DesktopTable;
