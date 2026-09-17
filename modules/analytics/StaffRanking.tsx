'use client';

import { Badge } from '@/components/ui/badge';
import { formatMoney } from '@/lib/money';
import type { StaffRankingEntry } from '@/types/reports.types';
import RankedList, { type RankedRow } from './RankedList';
import CurrencySections from './CurrencySections';
import groupByCurrency from './utils/groupByCurrency';

interface Props {
	entries: StaffRankingEntry[];
}

/** Un profesional dentro de una moneda: lo que el ranking dibuja como fila. */
interface StaffInCurrency {
	staffId: string;
	staffName: string;
	completedAppointments: number;
	commissionRate: number | null;
	isFormer: boolean;
	earning: StaffRankingEntry['earnings'][number];
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
/**
 * Cada profesional se abre en una fila por moneda.
 *
 * Quien cobra en dos aparece en las dos secciones, con lo suyo en cada una. Es
 * lo que hace comparables las barras: dentro de una moneda, la altura significa
 * algo.
 */
const toRows = (entries: StaffRankingEntry[]): StaffInCurrency[] =>
	entries.flatMap((entry) =>
		entry.earnings.map((earning) => ({
			staffId: entry.staffId,
			staffName: entry.staffName,
			completedAppointments: entry.completedAppointments,
			commissionRate: entry.commissionRate,
			isFormer: entry.isFormer,
			earning,
		})),
	);

const toRow = (row: StaffInCurrency): RankedRow => {
	const { currency, amount, averageTicket, estimatedCommission } = row.earning;

	const meta = [
		`${row.completedAppointments} ${row.completedAppointments === 1 ? 'atendida' : 'atendidas'}`,
		`${formatMoney(averageTicket, currency)} por cita`,
		estimatedCommission !== null
			? `comisión ${formatMoney(estimatedCommission, currency)}${
					row.commissionRate !== null ? ` (${row.commissionRate}%)` : ''
				}`
			: null,
	]
		.filter(Boolean)
		.join(' · ');

	return {
		id: `${row.staffId}:${currency}`,
		label: row.staffName,
		value: amount,
		valueLabel: formatMoney(amount, currency),
		meta,
		badge: row.isFormer ? (
			<Badge variant="outline" className="shrink-0 font-normal">
				Ya no trabaja
			</Badge>
		) : undefined,
	};
};

const StaffRanking: React.FC<Props> = ({ entries }) => {
	return (
		<CurrencySections
			groups={groupByCurrency(
				toRows(entries),
				(row) => row.earning.currency,
				(row) => row.earning.amount,
			)}
			render={(items) => (
				<RankedList
					rows={items.map(toRow)}
					emptyMessage="Todavía no hay citas atendidas en este período."
				/>
			)}
		/>
	);
};

export default StaffRanking;
