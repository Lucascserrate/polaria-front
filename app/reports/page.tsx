'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PeriodSelector from '@/modules/reports/PeriodSelector';
import ReportSummaryCards from '@/modules/reports/ReportSummaryCards';
import StaffRankingTable from '@/modules/reports/StaffRankingTable';
import ServiceRankingTable from '@/modules/reports/ServiceRankingTable';
import { formatRange } from '@/modules/reports/utils/format';
import { getReport } from '@/services/reports';
import type { ReportPreset, TenantReport } from '@/types/reports.types';

const todayIso = (): string => {
	const now = new Date();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${now.getFullYear()}-${month}-${day}`;
};

const ReportsPage = () => {
	const [preset, setPreset] = useState<ReportPreset>('today');
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
		queryKey: ['report', preset, preset === 'custom' ? from : '', preset === 'custom' ? to : ''],
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
				<h1 className="text-3xl font-bold tracking-tight">Contabilidad</h1>
				<p className="text-muted-foreground mt-1">
					Ingresos del negocio y cuánto le corresponde a cada profesional
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
				<p className="text-muted-foreground py-12 text-center">
					Cargando reporte...
				</p>
			)}

			{isError && (
				<p className="text-red-600 py-12 text-center">
					No se pudo cargar el reporte. Intenta de nuevo.
				</p>
			)}

			{data && !isLoading && (
				<div className="space-y-6">
					<p className="text-sm text-muted-foreground">{rangeLabel}</p>

					<ReportSummaryCards
						summary={data.summary}
						currency={data.currency}
					/>

					<div className="bg-card border border-border rounded-lg p-6">
						<h2 className="text-xl font-semibold mb-4">Por profesional</h2>
						<StaffRankingTable
							entries={data.staffRanking}
							currency={data.currency}
						/>
					</div>

					<div className="bg-card border border-border rounded-lg p-6">
						<h2 className="text-xl font-semibold mb-4">Por servicio</h2>
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

export default ReportsPage;
