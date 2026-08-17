'use client';

import { Banknote, CalendarCheck, Receipt, XCircle } from 'lucide-react';
import { formatMoney } from '@/modules/reports/utils/format';
import type { ReportSummary } from '@/types/reports.types';

interface Props {
	summary: ReportSummary;
	currency: string;
}

const ReportSummaryCards: React.FC<Props> = ({ summary, currency }) => {
	const cards = [
		{
			label: 'Ingresos',
			value: formatMoney(summary.revenueTotal, currency),
			hint: 'Solo citas atendidas',
			icon: Banknote,
		},
		{
			label: 'Citas atendidas',
			value: String(summary.completedCount),
			hint: `${summary.pendingCount} por atender`,
			icon: CalendarCheck,
		},
		{
			label: 'Ticket promedio',
			value: formatMoney(summary.averageTicket, currency),
			hint: 'Por cita atendida',
			icon: Receipt,
		},
		{
			label: 'Canceladas',
			value: String(summary.cancelledCount),
			hint: 'No suman ingresos',
			icon: XCircle,
		},
	];

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
			{cards.map((card) => {
				const Icon = card.icon;
				return (
					<div
						key={card.label}
						className="bg-card border border-border rounded-lg p-6"
					>
						<div className="flex items-center justify-between">
							<span className="text-sm font-medium text-muted-foreground">
								{card.label}
							</span>
							<Icon className="w-4 h-4 text-muted-foreground" />
						</div>
						<p className="text-3xl font-bold mt-2">{card.value}</p>
						<p className="text-xs text-muted-foreground mt-2">{card.hint}</p>
					</div>
				);
			})}
		</div>
	);
};

export default ReportSummaryCards;
