import { Clock, User, Scissors, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
}

const toAmPm = (timeLabel: string): string => {
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
	timeLabel,
	clientName,
	service,
	barber,
	status,
	duration,
}: AppointmentCardProps) {
	const colors = STATUS_COLORS[status] ?? STATUS_COLORS.booked;
	const timeStr = toAmPm(timeLabel);

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
				</div>
			</div>
		</div>
	);
}
