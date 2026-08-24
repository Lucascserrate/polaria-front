'use client';

import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { formatMoney } from '@/modules/analytics/utils/format';
import type { StaffRankingEntry } from '@/types/reports.types';

interface Props {
	entries: StaffRankingEntry[];
	currency: string;
}

const StaffRankingTable: React.FC<Props> = ({ entries, currency }) => {
	if (entries.length === 0) {
		return (
			<p className="text-sm text-muted-foreground py-8 text-center">
				Todavía no hay citas atendidas en este período.
			</p>
		);
	}

	const totalCommission = entries.reduce(
		(sum, entry) => sum + (entry.estimatedCommission ?? 0),
		0,
	);

	return (
		<>
			{/* Desktop */}
			<div className="hidden md:block border border-border rounded-lg overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Profesional</TableHead>
							<TableHead className="text-right">Atendidas</TableHead>
							<TableHead className="text-right">Facturado</TableHead>
							<TableHead className="text-right">Comisión</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{entries.map((entry) => (
							<TableRow key={entry.staffId}>
								<TableCell className="font-medium">
									<div className="flex items-center gap-2">
										{entry.staffName}
										{entry.isFormer && (
											<Badge variant="outline" className="font-normal">
												Ya no trabaja
											</Badge>
										)}
									</div>
								</TableCell>
								<TableCell className="text-right">
									{entry.completedAppointments}
								</TableCell>
								<TableCell className="text-right">
									{formatMoney(entry.revenue, currency)}
								</TableCell>
								<TableCell className="text-right">
									{entry.estimatedCommission === null ? (
										<span className="text-muted-foreground">Sin comisión</span>
									) : (
										<>
											<span className="font-medium">
												{formatMoney(entry.estimatedCommission, currency)}
											</span>
											<span className="text-xs text-muted-foreground ml-1">
												({entry.commissionRate}%)
											</span>
										</>
									)}
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
						key={entry.staffId}
						className="border border-border rounded-lg p-4 space-y-2"
					>
						<div className="flex items-center justify-between gap-2">
							<span className="font-medium">{entry.staffName}</span>
							<span className="font-semibold">
								{formatMoney(entry.revenue, currency)}
							</span>
						</div>
						<div className="flex items-center justify-between text-sm text-muted-foreground">
							<span>{entry.completedAppointments} atendidas</span>
							<span>
								{entry.estimatedCommission === null
									? 'Sin comisión'
									: `Comisión ${formatMoney(entry.estimatedCommission, currency)} (${entry.commissionRate}%)`}
							</span>
						</div>
					</div>
				))}
			</div>

			{totalCommission > 0 && (
				<p className="text-sm text-muted-foreground mt-4">
					Total a pagar en comisiones:{' '}
					<span className="font-semibold text-foreground">
						{formatMoney(totalCommission, currency)}
					</span>
				</p>
			)}
		</>
	);
};

export default StaffRankingTable;
