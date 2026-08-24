'use client';

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { formatMoney } from '@/modules/analytics/utils/format';
import type { ServiceRankingEntry } from '@/types/reports.types';

interface Props {
	entries: ServiceRankingEntry[];
	currency: string;
}

const ServiceRankingTable: React.FC<Props> = ({ entries, currency }) => {
	if (entries.length === 0) {
		return (
			<p className="text-sm text-muted-foreground py-8 text-center">
				Todavía no hay servicios facturados en este período.
			</p>
		);
	}

	return (
		<>
			{/* Desktop */}
			<div className="hidden md:block border border-border rounded-lg overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Servicio</TableHead>
							<TableHead className="text-right">Veces</TableHead>
							<TableHead className="text-right">Facturado</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{entries.map((entry) => (
							<TableRow key={entry.serviceId}>
								<TableCell className="font-medium">
									{entry.serviceName}
								</TableCell>
								<TableCell className="text-right">
									{entry.timesPerformed}
								</TableCell>
								<TableCell className="text-right">
									{formatMoney(entry.revenue, currency)}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Mobile */}
			<div className="md:hidden space-y-3">
				{entries.map((entry) => (
					<div
						key={entry.serviceId}
						className="border border-border rounded-lg p-4 flex items-center justify-between gap-2"
					>
						<div>
							<p className="font-medium">{entry.serviceName}</p>
							<p className="text-sm text-muted-foreground">
								{entry.timesPerformed} veces
							</p>
						</div>
						<span className="font-semibold">
							{formatMoney(entry.revenue, currency)}
						</span>
					</div>
				))}
			</div>
		</>
	);
};

export default ServiceRankingTable;
