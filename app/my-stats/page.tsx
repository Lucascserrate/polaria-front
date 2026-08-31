'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import PeriodSelector from '@/modules/analytics/PeriodSelector';
import AnalyticsTimeline from '@/modules/analytics/AnalyticsTimeline';
import ServiceRanking from '@/modules/analytics/ServiceRanking';
import { formatRange } from '@/modules/analytics/utils/format';
import RevenueSnapshots from '@/modules/me/RevenueSnapshots';
import MyWorkSummary from '@/modules/me/MyWorkSummary';
import { getMyReport } from '@/services/reports';
import type { DateRange } from '@/lib/dateRange';
import type { ReportPreset, StaffReport } from '@/types/reports.types';

const todayIso = (): string => {
	const now = new Date();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	return `${now.getFullYear()}-${month}-${day}`;
};

/**
 * Mis estadísticas: cómo viene el trabajo de quien mira.
 *
 * Reusa el selector de período, el gráfico y el ranking de servicios de las
 * analíticas del negocio, porque son las mismas preguntas con otro alcance. Lo que
 * no reusa es el resumen: el del negocio habla de tickets promedio y el de una
 * persona habla de cuánta gente atendió.
 *
 * Y lo que no aparece es el ranking del equipo. No está escondido por permisos:
 * comparar a alguien con sus compañeros no es información sobre su trabajo.
 */
const MyStatsPage = () => {
	const [preset, setPreset] = useState<ReportPreset>('month');
	const [range, setRange] = useState<DateRange>(() => {
		const today = todayIso();
		return { from: today, to: today };
	});

	const isCustom = preset === 'custom';

	const { data, isLoading, isError, error } = useQuery<StaffReport>({
		queryKey: [
			'my-report',
			preset,
			isCustom ? range.from : '',
			isCustom ? range.to : '',
		],
		queryFn: () =>
			getMyReport({ preset, from: range.from, to: range.to ?? range.from }),
		// Con el rango a medias no hay nada que consultar todavía; el resultado
		// anterior se queda en pantalla mientras se elige el segundo día.
		enabled: !isCustom || range.to !== null,
	});

	/**
	 * Pasar a "Personalizado" arranca desde el período que se está mirando.
	 *
	 * Además de ser lo esperable, esas fechas vienen resueltas por el backend en la
	 * zona del negocio, mientras que el reloj del navegador puede estar un día
	 * corrido.
	 */
	const handlePresetChange = (next: ReportPreset) => {
		if (next === 'custom' && data) {
			setRange({ from: data.range.from, to: data.range.to });
		}
		setPreset(next);
	};

	const rangeLabel = useMemo(
		() => (data ? formatRange(data.range.from, data.range.to) : null),
		[data],
	);

	/*
	 * El dueño no tiene números propios: no es una ficha del equipo, y los del
	 * negocio son los suyos. El backend responde 404, y decirle "no se pudieron
	 * cargar" lo mandaría a buscar una falla que no existe.
	 */
	const notApplicable =
		axios.isAxiosError(error) && error.response?.status === 404;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
					Mis estadísticas
				</h1>
				<p className="mt-1 text-muted-foreground">
					{data?.staff.name
						? `Tu trabajo, ${data.staff.name.split(' ')[0]}.`
						: 'Tu trabajo.'}{' '}
					Solo tuyo: nadie más aparece acá.
				</p>
			</div>

			{notApplicable ? (
				<div className="space-y-4 rounded-xl border border-border p-6">
					<p className="text-sm text-muted-foreground">
						Esta pantalla es para los profesionales del equipo. Entraste con la
						cuenta del negocio, así que los números que te corresponden son los
						del local completo.
					</p>
					<Button asChild variant="outline">
						<Link href={ROUTES.analytics}>Ir a Analíticas</Link>
					</Button>
				</div>
			) : isError ? (
				<p className="rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
					No se pudieron cargar tus números. Se vuelve a intentar solo.
				</p>
			) : isLoading || !data ? (
				<p className="py-16 text-center text-muted-foreground">
					Cargando tus números…
				</p>
			) : (
				<>
					<RevenueSnapshots
						snapshots={data.revenueSnapshots}
						currency={data.currency}
					/>

					<div className="border-t border-border pt-6">
						<PeriodSelector
							preset={preset}
							range={range}
							onPresetChange={handlePresetChange}
							onRangeChange={setRange}
						/>
					</div>

					<MyWorkSummary
						summary={data.summary}
						currency={data.currency}
						rangeLabel={rangeLabel}
					/>

					{data.timeline && (
						<section className="space-y-3">
							<h2 className="text-sm font-semibold">Cómo evolucionó</h2>
							<AnalyticsTimeline
								timeline={data.timeline}
								currency={data.currency}
							/>
						</section>
					)}

					<section className="space-y-3">
						<h2 className="text-sm font-semibold">Lo que más hiciste</h2>
						<ServiceRanking
							entries={data.serviceRanking}
							currency={data.currency}
						/>
					</section>
				</>
			)}
		</div>
	);
};

export default MyStatsPage;
