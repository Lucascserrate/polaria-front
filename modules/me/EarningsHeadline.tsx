'use client';

import { ArrowDownRight, ArrowUpRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { formatMoney } from '@/lib/money';
import { cn } from '@/lib/utils';
import { comparisonLabel, periodLabel } from '@/modules/analytics/utils/format';
import type { StaffReport } from '@/types/reports.types';
import { compareRevenue, type RevenueComparison } from './utils/comparison';

interface Props {
	report: StaffReport;
}

/**
 * El número con el que se abre la pantalla: lo que le queda a quien trabajó.
 *
 * El titular es la **comisión**, no lo facturado, y la diferencia no es de matiz:
 * quien generó Bs 200 con un 30% se lleva Bs 60, y ver "Bs 200" grande es leer la
 * plata de otro. Lo generado no desaparece —queda abajo, que es de donde sale la
 * comisión—, pero deja de ser el titular.
 *
 * Cuando el negocio no configuró comisión el titular vuelve a ser lo generado. No
 * es un caso raro: hay barberías de sueldo fijo y de alquiler de silla, y ahí una
 * comisión de Bs 0 sería una mentira más grande que no mostrar nada.
 *
 * Debajo del monto va la comparación con el período anterior, que es lo único que
 * convierte una cifra en información: "Bs 200" no dice nada, "Bs 200, 12% más que
 * el mes pasado" sí.
 */
const EarningsHeadline: React.FC<Props> = ({ report }) => {
	const { currency, staff, summary, comparison, currentMonth } = report;
	const { preset } = report.range;

	const rate = staff.commissionRate;
	const paysCommission = rate !== null;
	const headline = paysCommission
		? (summary.estimatedCommission ?? 0)
		: summary.revenueTotal;

	const trend = compareRevenue(
		summary.revenueTotal,
		comparison.summary.revenueTotal,
	);

	return (
		<section className="rounded-xl border border-border bg-card p-5 sm:p-6">
			<div className="flex items-start justify-between gap-2">
				<p className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
					{paysCommission ? 'Tu comisión' : 'Generado'} ·{' '}
					{periodLabel(preset, report.range)}
				</p>

				<Explainer
					rate={rate}
					revenue={summary.revenueTotal}
					currency={currency}
				/>
			</div>

			<p className="text-4xl font-bold tracking-tight tabular-nums sm:text-5xl">
				{formatMoney(headline, currency)}
			</p>

			<Trend
				comparison={trend}
				label={comparisonLabel(preset, comparison.range)}
				previous={comparison.summary.revenueTotal}
				currency={currency}
			/>

			{paysCommission && (
				<p className="mt-1.5 text-sm text-muted-foreground">
					de {formatMoney(summary.revenueTotal, currency)} generados · {rate}%
				</p>
			)}

			<div className="mt-4 space-y-1 border-t border-border pt-3 text-sm text-muted-foreground">
				{summary.completedCount > 0 ? (
					<p>
						<Strong>{summary.completedCount}</Strong>{' '}
						{summary.completedCount === 1 ? 'cita atendida' : 'citas atendidas'}{' '}
						· <Strong>{formatMoney(summary.averageTicket, currency)}</Strong> por
						cita
					</p>
				) : (
					<p>Todavía no hay citas atendidas en este período.</p>
				)}

				{/*
				 * El mes en curso, para quien está mirando un día o una semana. Es una
				 * línea y no una tarjeta aparte: sin este contexto, un "hoy" consultado a
				 * media mañana se lee como una pantalla vacía. Con el mes seleccionado
				 * sobra, porque el titular ya es ese número.
				 */}
				{preset !== 'month' && (
					<p>
						Este mes:{' '}
						<Strong>{formatMoney(currentMonth.revenue, currency)}</Strong>{' '}
						generados
						{currentMonth.estimatedCommission !== null && (
							<>
								{' '}
								·{' '}
								<Strong>
									{formatMoney(currentMonth.estimatedCommission, currency)}
								</Strong>{' '}
								tuyos
							</>
						)}
					</p>
				)}
			</div>
		</section>
	);
};

const Strong: React.FC<{ children: React.ReactNode }> = ({ children }) => (
	<span className="font-medium text-foreground tabular-nums">{children}</span>
);

interface TrendProps {
	comparison: RevenueComparison;
	/** El período anterior, ya nombrado: "julio", "la semana pasada". */
	label: string;
	/** Lo generado entonces, para cuando no hay porcentaje que mostrar. */
	previous: number;
	currency: string;
}

/**
 * Cómo viene el período contra el anterior.
 *
 * La subida se pinta y la bajada no. No es maquillaje: una mala semana ya se ve
 * en el número de arriba, y pintarla de rojo es marcarle la falta a alguien que
 * capaz estuvo enfermo. La flecha alcanza para decir la dirección.
 */
const Trend: React.FC<TrendProps> = ({
	comparison,
	label,
	previous,
	currency,
}) => {
	if (comparison.trend === 'none') return null;

	if (comparison.trend === 'flat') {
		return (
			<p className="mt-1 text-sm text-muted-foreground">Igual que {label}</p>
		);
	}

	const isUp = comparison.trend === 'up';
	const Arrow = isUp ? ArrowUpRight : ArrowDownRight;

	return (
		<p
			className={cn(
				'mt-1 flex items-center gap-1 text-sm font-medium',
				isUp
					? 'text-emerald-600 dark:text-emerald-500'
					: 'text-muted-foreground',
			)}
		>
			<Arrow className="h-4 w-4 shrink-0" aria-hidden="true" />
			{comparison.percent === null
				? `${label} cerró en ${formatMoney(previous, currency)}`
				: `${comparison.percent}% vs. ${label}`}
		</p>
	);
};

interface ExplainerProps {
	rate: number | null;
	revenue: number;
	currency: string;
}

/**
 * De dónde sale el número, detrás de un ⓘ.
 *
 * Es un popover y no un tooltip porque esta pantalla se usa desde el teléfono, y
 * un tooltip que aparece al pasar el mouse no existe cuando no hay mouse.
 *
 * Sin tasa configurada el ⓘ sigue estando, y es cuando más sirve: explica por qué
 * no hay comisión y qué pedirle al negocio para que la haya.
 */
const Explainer: React.FC<ExplainerProps> = ({ rate, revenue, currency }) => (
	<Popover>
		<PopoverTrigger asChild>
			<Button
				type="button"
				variant="ghost"
				size="icon-sm"
				className="-mt-1 -mr-1 shrink-0 text-muted-foreground"
				aria-label="Cómo se calcula este número"
			>
				<Info className="h-4 w-4" />
			</Button>
		</PopoverTrigger>

		<PopoverContent align="end" className="w-72 text-sm">
			{rate === null ? (
				<p>
					El negocio no configuró una comisión para vos, así que acá va todo lo
					que generaste. Si trabajás a porcentaje, pedile que la cargue en tu
					ficha.
				</p>
			) : (
				<>
					<p>
						Tu {rate}% sobre los {formatMoney(revenue, currency)} que facturaste
						en este período.
					</p>
					<p className="mt-2 text-muted-foreground">
						Es una estimación con tu comisión de hoy. Lo que se te paga lo
						liquida el negocio.
					</p>
				</>
			)}
		</PopoverContent>
	</Popover>
);

export default EarningsHeadline;
