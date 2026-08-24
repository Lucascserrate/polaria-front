'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PeriodSelector from '@/modules/analytics/PeriodSelector';
import AnalyticsSummary from '@/modules/analytics/AnalyticsSummary';
import StaffRankingTable from '@/modules/analytics/StaffRankingTable';
import ServiceRankingTable from '@/modules/analytics/ServiceRankingTable';
import { formatRange } from '@/modules/analytics/utils/format';
import { getReport } from '@/services/reports';
import type { ReportPreset, TenantReport } from '@/types/reports.types';

const todayIso = (): string => {
	const now = new Date();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${now.getFullYear()}-${month}-${day}`;
};

/**
 * Analíticas: cómo viene el negocio.
 *
 * Reemplaza a Contabilidad, que mostraba los mismos datos con la jerarquía
 * plana: cuatro tarjetas iguales y dos tablas. Acá la facturación es el titular
 * —es la pregunta que trae a alguien a esta pantalla— y el resto la explica.
 *
 * Los datos son los mismos y salen del mismo endpoint: lo que cambia es qué se
 * mira primero.
 */
const AnalyticsPage = () => {
	const [preset, setPreset] = useState<ReportPreset>('month');
	const [from, setFrom] = useState(todayIso);
	const [to, setTo] = useState(todayIso);

	// El rango invertido se ataja acá para no disparar una consulta que el
	// backend va a rechazar igual.
	const rangeError =
		preset === 'custom' && from && to && from > to
			? 'La fecha inicial no puede ser posterior a la final.'
			: null;

	const isCustomReady = preset !== 'custom' || (!!from && !!to && !rangeError);

	const { data, isLoading, isError } = useQuery<TenantReport>({
		queryKey: [
			'report',
			preset,
			preset === 'custom' ? from : '',
			preset === 'custom' ? to : '',
		],
		queryFn: () => getReport({ preset, from, to }),
		enabled: isCustomReady,
	});

	const rangeLabel = useMemo(
		() => (data ? formatRange(data.range.from, data.range.to) : null),
		[data],
	);

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Analíticas</h1>
				<p className="mt-1 text-muted-foreground">
					Cómo viene el negocio: cuánto factura, quién atiende y qué se vende
				</p>
			</div>

			<PeriodSelector
				preset={preset}
				from={from}
				to={to}
				onPresetChange={setPreset}
				onFromChange={setFrom}
				onToChange={setTo}
				error={rangeError}
			/>

			{isLoading && (
				<p className="py-12 text-center text-muted-foreground">
					Cargando analíticas...
				</p>
			)}

			{isError && (
				<p className="py-12 text-center text-red-600">
					No se pudieron cargar las analíticas. Intentá de nuevo.
				</p>
			)}

			{data && !isLoading && (
				<div className="space-y-6">
					<AnalyticsSummary
						summary={data.summary}
						currency={data.currency}
						rangeLabel={rangeLabel}
					/>

					<div className="rounded-lg border border-border bg-card p-6">
						<h2 className="mb-4 text-xl font-semibold">Por profesional</h2>
						<StaffRankingTable
							entries={data.staffRanking}
							currency={data.currency}
						/>
					</div>

					<div className="rounded-lg border border-border bg-card p-6">
						<h2 className="mb-4 text-xl font-semibold">Por servicio</h2>
						<ServiceRankingTable
							entries={data.serviceRanking}
							currency={data.currency}
						/>
					</div>
				</div>
			)}
		</div>
	);
};

export default AnalyticsPage;
