'use client';

import {
	Bar,
	BarChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';
import { formatMoney } from '@/lib/money';
import type { ReportTimeline } from '@/types/reports.types';
import { bucketAxisLabel, bucketFullLabel } from './utils/timelineLabels';

interface Props {
	timeline: ReportTimeline;
	currency: string;
}

/**
 * Cómo evolucionó la facturación dentro del período.
 *
 * Es el único gráfico de la pantalla, y está porque responde algo que ninguna
 * cifra puede: si el mes viene subiendo, si hubo un pico el sábado o si los
 * lunes están muertos. El total dice cuánto; esto dice cómo se llegó.
 *
 * Los rankings de al lado no llevan gráfico propio a propósito: ahí la barra vive
 * dentro de la fila, junto al número. Un gráfico aparte mostraría lo mismo dos
 * veces.
 */
const AnalyticsTimeline: React.FC<Props> = ({ timeline, currency }) => {
	const data = timeline.buckets.map((bucket) => ({
		...bucket,
		axis: bucketAxisLabel(bucket.key, timeline.granularity),
	}));

	return (
		<div className="h-56 w-full">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
					{/* Solo líneas horizontales: son las que ayudan a leer la altura. */}
					<CartesianGrid
						vertical={false}
						stroke="var(--border)"
						strokeDasharray="3 3"
					/>

					<XAxis
						dataKey="axis"
						tickLine={false}
						axisLine={false}
						tickMargin={8}
						// Con muchas barras, recharts saltea etiquetas en lugar de
						// encimarlas; los extremos se conservan para ubicar el período.
						interval="preserveStartEnd"
						tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
					/>

					<YAxis
						width={52}
						tickLine={false}
						axisLine={false}
						tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
						tickFormatter={(value: number) => formatMoney(value, currency)}
					/>

					<Tooltip
						cursor={{ fill: 'var(--muted)' }}
						content={({ active, payload }) => {
							if (!active || !payload?.length) return null;

							const bucket = payload[0].payload as (typeof data)[number];

							return (
								<div className="rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md">
									<p className="text-xs font-medium">
										{bucketFullLabel(bucket.key, timeline.granularity)}
									</p>
									<p className="mt-1 text-sm font-semibold tabular-nums">
										{formatMoney(bucket.revenue, currency)}
									</p>
									<p className="text-xs text-muted-foreground">
										{bucket.completed}{' '}
										{bucket.completed === 1
											? 'cita atendida'
											: 'citas atendidas'}
									</p>
								</div>
							);
						}}
					/>

					<Bar
						dataKey="revenue"
						fill="var(--foreground)"
						radius={[3, 3, 0, 0]}
						maxBarSize={48}
					/>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
};

export default AnalyticsTimeline;
