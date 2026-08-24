'use client';

import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/lib/money';
import type { StaffRankingEntry } from '@/types/reports.types';
import RankedList, { type RankedRow } from './RankedList';

interface Props {
	entries: StaffRankingEntry[];
	currency: string;
}

/**
 * Quién rinde más.
 *
 * La comisión aparece solo cuando el negocio configuró una tasa: mostrar
 * "sin comisión" en cada fila ocuparía el mismo lugar para no decir nada.
 *
 * Los profesionales dados de baja siguen apareciendo con su marca. Lo facturado
 * en el período ocurrió, y borrarlos de la lista dejaría un total que no cierra
 * con la suma de sus filas.
 */
const StaffRanking: React.FC<Props> = ({ entries, currency }) => {
	const rows: RankedRow[] = entries.map((entry) => {
		const perAppointment =
			entry.completedAppointments > 0
				? entry.revenue / entry.completedAppointments
				: 0;

		const meta = [
			`${entry.completedAppointments} ${entry.completedAppointments === 1 ? 'atendida' : 'atendidas'}`,
			`${formatMoney(perAppointment, currency)} por cita`,
			entry.estimatedCommission !== null
				? `comisión ${formatMoney(entry.estimatedCommission, currency)}${
						entry.commissionRate !== null ? ` (${entry.commissionRate}%)` : ''
					}`
				: null,
		]
			.filter(Boolean)
			.join(' · ');

		return {
			id: entry.staffId,
			label: entry.staffName,
			value: entry.revenue,
			valueLabel: formatMoney(entry.revenue, currency),
			meta,
			badge: entry.isFormer ? (
				<Badge variant="outline" className="shrink-0 font-normal">
					Ya no trabaja
				</Badge>
			) : undefined,
		};
	});

	return (
		<RankedList
			rows={rows}
			emptyMessage="Todavía no hay citas atendidas en este período."
		/>
	);
};

export default StaffRanking;
