import { Clock, User, Scissors, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { STATUS_COLORS } from '@/lib/mocks';

interface AppointmentCardProps {
	id: string;
	time: Date;
	clientName: string;
	service: string;
	barber: string;
	status: 'confirmed' | 'completed' | 'cancelled';
	duration: number;
}

export function AppointmentCard({
	time,
	clientName,
	service,
	barber,
	status,
	duration,
}: AppointmentCardProps) {
	const colors = STATUS_COLORS[status];
	const timeStr = time.toLocaleTimeString('en-US', {
		hour: '2-digit',
		minute: '2-digit',
	});

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
							{status.charAt(0).toUpperCase() + status.slice(1)}
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
				</div>
			</div>
		</div>
	);
}
