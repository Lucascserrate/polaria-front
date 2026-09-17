'use client';

import { formatMoney } from '@/lib/money';
import type { ServiceRankingEntry } from '@/types/reports.types';
import RankedList, { type RankedRow } from './RankedList';
import CurrencySections from './CurrencySections';
import groupByCurrency from './utils/groupByCurrency';

interface Props {
	entries: ServiceRankingEntry[];
}

/**
 * Qué se vende más.
 *
 * El promedio por vez sale de dividir lo facturado entre las veces prestado, y no
 * del precio del catálogo: es lo que efectivamente se cobró. Si el precio cambió
 * en el medio, o hubo un servicio con precio distinto al de hoy, esta cifra lo
 * refleja y el catálogo no.
 */
const toRow = (entry: ServiceRankingEntry): RankedRow => {
	const perTime =
		entry.timesPerformed > 0 ? entry.revenue / entry.timesPerformed : 0;

	return {
		// El id lleva la moneda: un servicio que cambió de moneda en el período
		// aparece una vez por cada una, y dos filas no pueden compartir clave.
		id: `${entry.serviceId}:${entry.currency}`,
		label: entry.serviceName,
		value: entry.revenue,
		valueLabel: formatMoney(entry.revenue, entry.currency),
		meta: `${entry.timesPerformed} ${
			entry.timesPerformed === 1 ? 'vez' : 'veces'
		} · ${formatMoney(perTime, entry.currency)} por vez`,
	};
};

const ServiceRanking: React.FC<Props> = ({ entries }) => (
	<CurrencySections
		groups={groupByCurrency(
			entries,
			(entry) => entry.currency,
			(entry) => entry.revenue,
		)}
		render={(items) => (
			<RankedList
				rows={items.map(toRow)}
				emptyMessage="Todavía no hay servicios facturados en este período."
			/>
		)}
	/>
);

export default ServiceRanking;
