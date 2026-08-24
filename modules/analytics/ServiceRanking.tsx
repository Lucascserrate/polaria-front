'use client';

import { formatMoney } from '@/lib/money';
import type { ServiceRankingEntry } from '@/types/reports.types';
import RankedList, { type RankedRow } from './RankedList';

interface Props {
	entries: ServiceRankingEntry[];
	currency: string;
}

/**
 * Qué se vende más.
 *
 * El promedio por vez sale de dividir lo facturado entre las veces prestado, y no
 * del precio del catálogo: es lo que efectivamente se cobró. Si el precio cambió
 * en el medio, o hubo un servicio con precio distinto al de hoy, esta cifra lo
 * refleja y el catálogo no.
 */
const ServiceRanking: React.FC<Props> = ({ entries, currency }) => {
	const rows: RankedRow[] = entries.map((entry) => {
		const perTime =
			entry.timesPerformed > 0 ? entry.revenue / entry.timesPerformed : 0;

		return {
			id: entry.serviceId,
			label: entry.serviceName,
			value: entry.revenue,
			valueLabel: formatMoney(entry.revenue, currency),
			meta: `${entry.timesPerformed} ${
				entry.timesPerformed === 1 ? 'vez' : 'veces'
			} · ${formatMoney(perTime, currency)} por vez`,
		};
	});

	return (
		<RankedList
			rows={rows}
			emptyMessage="Todavía no hay servicios facturados en este período."
		/>
	);
};

export default ServiceRanking;
