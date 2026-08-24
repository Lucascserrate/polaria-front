'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import PeriodSelector from '@/modules/analytics/PeriodSelector';
import AnalyticsSummary from '@/modules/analytics/AnalyticsSummary';
import AnalyticsTimeline from '@/modules/analytics/AnalyticsTimeline';
import StaffRanking from '@/modules/analytics/StaffRanking';
import ServiceRanking from '@/modules/analytics/ServiceRanking';
import { formatRange } from '@/modules/analytics/utils/format';
import { getReport } from '@/services/reports';
import type { DateRange } from '@/lib/dateRange';
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
	const [range, setRange] = useState<DateRange>(() => {
		const today = todayIso();
		return { from: today, to: today };
	});

	const isCustom = preset === 'custom';

	const { data, isLoading, isError } = useQuery<TenantReport>({
		queryKey: [
			'report',
			preset,
			isCustom ? range.from : '',
			isCustom ? range.to : '',
		],
		queryFn: () =>
			getReport({ preset, from: range.from, to: range.to ?? range.from }),
		// Con el rango a medias no hay nada que consultar todavía; el resultado
		// anterior se queda en pantalla mientras se elige el segundo día.
		enabled: !isCustom || range.to !== null,
	});

	/**
	 * Pasar a "Personalizado" arranca desde el período que se está mirando.
	 *
	 * Además de ser lo esperable —se ajusta lo que ya está en pantalla—, esas
	 * fechas vienen resueltas por el backend en la zona del negocio, mientras que
	 * el reloj del navegador puede estar un día corrido.
	 */
	const changePreset = (next: ReportPreset) => {
		if (next === 'custom' && !isCustom && data) {
			setRange({ from: data.range.from, to: data.range.to });
		}
		setPreset(next);
	};

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
				range={range}
				onPresetChange={changePreset}
				onRangeChange={setRange}
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

					{/*
					 * Sin evolución cuando el rango es de un solo día: una sola barra no
					 * compara nada, y el titular ya dice ese número.
					 */}
					{data.timeline && (
						<section className="rounded-xl border border-border bg-card p-6">
							<h2 className="mb-4 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
								Evolución
							</h2>
							<AnalyticsTimeline
								timeline={data.timeline}
								currency={data.currency}
							/>
						</section>
					)}

					{/*
					 * Lado a lado en pantalla ancha: son dos respuestas a la misma
					 * pregunta —de dónde viene lo facturado— y compararlas de un vistazo
					 * dice más que leerlas una debajo de la otra.
					 */}
					<div className="grid gap-6 lg:grid-cols-2">
						<section className="rounded-xl border border-border bg-card p-6">
							<h2 className="mb-4 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
								Profesionales
							</h2>
							<StaffRanking
								entries={data.staffRanking}
								currency={data.currency}
							/>
						</section>

						<section className="rounded-xl border border-border bg-card p-6">
							<h2 className="mb-4 font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
								Servicios
							</h2>
							<ServiceRanking
								entries={data.serviceRanking}
								currency={data.currency}
							/>
						</section>
					</div>
				</div>
			)}
		</div>
	);
};

export default AnalyticsPage;
